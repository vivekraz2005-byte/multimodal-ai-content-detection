
"""Image analysis using metadata checks and an optional trained AI-image classifier."""

from pathlib import Path
from typing import Any, Dict, List, Tuple
import hashlib
import logging
import warnings

from PIL import Image

logger = logging.getLogger(__name__)

MAX_PIXELS = 80_000_000
GENERATOR_TERMS = (
    "stable diffusion", "midjourney", "dall-e", "dalle",
    "comfyui", "automatic1111", "novelai", "invokeai",
    "fooocus", "adobe firefly", "trainedalgorithmicmedia",
)

# Lazy-loaded model: load once and reuse for subsequent images.
_MODEL = None
_TRANSFORM = None
_MODEL_ERROR = None


def _load_detector():
    """Load the downloaded ConvNeXt checkpoint once, on CPU or CUDA."""
    global _MODEL, _TRANSFORM, _MODEL_ERROR

    if _MODEL is not None:
        return _MODEL, _TRANSFORM

    if _MODEL_ERROR is not None:
        raise RuntimeError(_MODEL_ERROR)

    try:
        import torch
        import timm
        from torchvision import transforms

        backend_dir = Path(__file__).resolve().parents[2]
        checkpoint_path = (
            backend_dir / "model_files" / "checkpoints"
            / "checkpoint_phase2.pth"
        )

        if not checkpoint_path.is_file():
            raise FileNotFoundError(
                f"Detector checkpoint not found: {checkpoint_path}"
            )

        device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        checkpoint = torch.load(
            checkpoint_path,
            map_location=device,
            weights_only=True,
        )

        model = timm.create_model(
            "convnextv2_base",
            pretrained=False,
            num_classes=2,
        )
        model.load_state_dict(checkpoint["model"])
        model.to(device)
        model.eval()

        _TRANSFORM = transforms.Compose([
            transforms.Resize(288),
            transforms.CenterCrop(256),
            transforms.ToTensor(),
            transforms.Normalize(
                (0.485, 0.456, 0.406),
                (0.229, 0.224, 0.225),
            ),
        ])

        _MODEL = (model, device)
        logger.info("ConvNeXt AI-image detector loaded on %s", device)
        return _MODEL, _TRANSFORM

    except Exception as exc:
        _MODEL_ERROR = f"{type(exc).__name__}: {exc}"
        logger.exception("Could not load AI-image detector")
        raise RuntimeError(_MODEL_ERROR) from exc


def _predict_image(image: Image.Image) -> Dict[str, float]:
    """Return the model's Real and AI-generated class scores."""
    import torch

    (model, device), transform = _load_detector()
    tensor = transform(image.convert("RGB")).unsqueeze(0).to(device)

    with torch.inference_mode():
        probabilities = torch.softmax(model(tensor), dim=1)[0]

    # Checkpoint class order was verified with the model's test script.
    return {
        "real": float(probabilities[0].item()),
        "fake": float(probabilities[1].item()),
    }


class ImageAnalyzer:
    @staticmethod
    def analyze(
        file_path: Path,
        metadata: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:

        path = Path(file_path)
        evidence: List[Dict[str, Any]] = []

        base: Dict[str, Any] = {
            "ai_generation_score": 0.0,
            "manipulation_score": 0.0,
            "ai_model_available": False,
            "manipulation_model_available": False,
            "score_semantics": (
                "AI score is the model's softmax output, not a calibrated "
                "probability or a guarantee of authenticity."
            ),
            "analysis_engine": "Image metadata checks; trained detector pending",
            "file_sha256": None,
            "file_md5": None,
            "raster_dimensions": None,
        }

        if not path.is_file():
            return ImageAnalyzer._error(
                base, evidence,
                "File does not exist or is not a regular file.",
            )

        try:
            sha256 = hashlib.sha256()
            md5 = hashlib.md5(usedforsecurity=False)

            with path.open("rb") as stream:
                for chunk in iter(
                    lambda: stream.read(1024 * 1024), b""
                ):
                    sha256.update(chunk)
                    md5.update(chunk)

            base["file_sha256"] = sha256.hexdigest()
            base["file_md5"] = md5.hexdigest()

            with warnings.catch_warnings():
                warnings.simplefilter(
                    "error", Image.DecompressionBombWarning
                )

                with Image.open(path) as img:
                    width, height = img.size

                    if (
                        width <= 0
                        or height <= 0
                        or width * height > MAX_PIXELS
                    ):
                        raise ValueError(
                            f"Unsafe image dimensions: {width}x{height}"
                        )

                    img.verify()

                with Image.open(path) as img:
                    img.load()
                    width, height = img.size

                    base["raster_dimensions"] = [width, height]
                    base["image_format"] = img.format or "UNKNOWN"
                    base["image_mode"] = img.mode
                    base["animated"] = bool(
                        getattr(img, "is_animated", False)
                    )

                    # Inspect metadata for known generator-related markers.
                    tags: List[str] = []

                    for key, value in (
                        getattr(img, "text", {}) or {}
                    ).items():
                        val = f"{key}: {value}"

                        if (
                            any(t in val.lower() for t in GENERATOR_TERMS)
                            or any(
                                t in str(key).lower()
                                for t in (
                                    "prompt", "workflow",
                                    "parameters", "generation",
                                )
                            )
                        ):
                            tags.append(val[:300])

                    exif = img.getexif()
                    software = str(exif.get(305, ""))

                    if software and any(
                        term in software.lower()
                        for term in GENERATOR_TERMS
                    ):
                        tags.append(f"EXIF Software: {software[:200]}")

                    if tags:
                        evidence.append({
                            "id": "IMG_EVID_GEN_SIGNATURE",
                            "title": "Generator-related metadata marker found",
                            "category": "AI Generation",
                            "severity": "Medium",
                            "description": (
                                "Metadata contains a string associated with "
                                "an image-generation tool. Metadata can be "
                                "edited or copied and is not proof."
                            ),
                            "technical_details": "; ".join(tags[:5]),
                        })
                    else:
                        evidence.append({
                            "id": "IMG_EVID_NO_GEN_MARKER",
                            "title": "No explicit generator marker found",
                            "category": "Metadata",
                            "severity": "Informational",
                            "description": (
                                "No known generator marker was found in the "
                                "inspected metadata. This does not establish "
                                "that the image is authentic."
                            ),
                            "technical_details": (
                                "Metadata scan only; see trained-model "
                                "result separately."
                            ),
                        })

                    evidence.append({
                        "id": "IMG_EVID_BASIC_VALIDATION",
                        "title": "Image decoded successfully",
                        "category": "File Integrity",
                        "severity": "Informational",
                        "description": (
                            f"Pillow decoded a {img.format or 'unknown-format'} "
                            f"image ({width}x{height}). Readability does not "
                            "establish authenticity."
                        ),
                        "technical_details": (
                            f"Mode={img.mode}; pixels={width * height:,}; "
                            f"animated={bool(getattr(img, 'is_animated', False))}"
                        ),
                    })

                    if (img.format or "").upper() == "JPEG":
                        evidence.append({
                            "id": "IMG_EVID_ELA_NOT_RUN",
                            "title": "ELA not used as an authenticity verdict",
                            "category": "Forensic Limitation",
                            "severity": "Informational",
                            "description": (
                                "JPEG recompression and resizing can affect "
                                "error-level differences. No manipulation "
                                "probability is inferred from ELA."
                            ),
                            "technical_details": (
                                "No trained manipulation model is configured."
                            ),
                        })

                    # Run the trained AI-vs-real classifier.
                    try:
                        class_scores = _predict_image(img)

                        base["ai_generation_score"] = class_scores["fake"]
                        base["ai_model_available"] = True
                        base["ai_class_scores"] = class_scores
                        base["analysis_engine"] = (
                            "xRayon ConvNeXtV2 AI-image classifier"
                        )
                        base["score_semantics"] = (
                            "ConvNeXt softmax class score; not a calibrated "
                            "probability or a guarantee of authenticity."
                        )

                        evidence.append({
                            "id": "IMG_EVID_TRAINED_AI_CLASSIFIER",
                            "title": "Trained AI-image classifier completed",
                            "category": "AI Generation",
                            "severity": "Informational",
                            "description": (
                                "A trained classifier compared the image "
                                "against its Real and AI-generated classes. "
                                "Its output is a model prediction, not proof."
                            ),
                            "technical_details": (
                                f"Real score={class_scores['real']:.4f}; "
                                f"AI-generated score={class_scores['fake']:.4f}"
                            ),
                        })

                    except Exception as model_exc:
                        logger.exception(
                            "AI-image inference failed for %s", path.name
                        )
                        base["ai_model_available"] = False
                        base["analysis_engine"] = (
                            "Image metadata checks; trained detector unavailable"
                        )
                        base["model_error"] = (
                            f"{type(model_exc).__name__}: {model_exc}"
                        )

                        evidence.append({
                            "id": "IMG_EVID_MODEL_UNAVAILABLE",
                            "title": "Trained AI-image detector unavailable",
                            "category": "System",
                            "severity": "Informational",
                            "description": (
                                "Metadata inspection completed, but the "
                                "trained model could not produce a result. "
                                "No AI-classification conclusion was made."
                            ),
                            "technical_details": str(model_exc)[:500],
                        })

            base["ai_marker_found"] = bool(tags)
            base["feature_summary"] = {
                "generator_metadata_marker": bool(tags),
                "trained_detector_used": base["ai_model_available"],
            }

            return base, evidence

        except Exception as exc:
            logger.exception("Image analysis failed for %s", path.name)
            return ImageAnalyzer._error(
                base,
                evidence,
                f"Image could not be safely decoded: {type(exc).__name__}: {exc}",
            )

    @staticmethod
    def _error(
        base: Dict[str, Any],
        evidence: List[Dict[str, Any]],
        message: str,
    ):
        evidence.append({
            "id": "IMG_EVID_PIPELINE_ERROR",
            "title": "Image analysis unavailable",
            "category": "System",
            "severity": "Informational",
            "description": message,
            "technical_details": (
                "The file was not assigned an AI probability because "
                "reliable analysis did not complete."
            ),
        })

        base.update({
            "analysis_error": message,
            "ai_model_available": False,
            "manipulation_model_available": False,
        })

        return base, evidence
