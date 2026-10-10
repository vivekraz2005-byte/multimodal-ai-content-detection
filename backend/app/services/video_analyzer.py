
"""Video analysis using the CakeLens AI-generated video detector."""

from pathlib import Path
from typing import Any, Dict, List, Tuple
import hashlib
import logging
import threading
import time

logger = logging.getLogger(__name__)

_model = None
_detector = None
_model_lock = threading.Lock()


def _get_detector():
    """Load CakeLens once and reuse it for subsequent videos."""
    global _model, _detector

    if _detector is not None:
        return _detector

    with _model_lock:
        if _detector is not None:
            return _detector

        from cakelens.model import Model
        from cakelens.detect import Detector

        print("[VIDEO] Loading CakeLens model...", flush=True)
        start = time.time()

        model = Model()
        model.load_from_huggingface_hub(device="cpu")
        model.eval()

        print(
            f"[VIDEO] Model loaded in {time.time() - start:.1f}s",
            flush=True,
        )

        _model = model
        _detector = Detector(
            model=model,
            batch_size=2,
            device="cpu",
        )

        print("[VIDEO] Detector ready.", flush=True)

    return _detector


class VideoAnalyzer:

    @staticmethod
    def analyze(
        file_path: Path,
        metadata: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:

        p = Path(file_path)
        evidence: List[Dict[str, Any]] = []

        result = {
            "ai_generation_score": 0.0,
            "manipulation_score": 0.0,
            "ai_model_available": False,
            "manipulation_model_available": False,
            "score_semantics": (
                "CakeLens model scores are sigmoid outputs, not calibrated "
                "probabilities or proof of AI generation."
            ),
            "model_architecture": "CakeLens v5 video classifier",
            "file_sha256": None,
        }

        try:
            if not p.is_file():
                raise FileNotFoundError(str(p))

            print(f"[VIDEO] Checking file: {p.name}", flush=True)

            # Calculate SHA-256 hash.
            hash_start = time.time()
            h = hashlib.sha256()

            with p.open("rb") as f:
                for chunk in iter(
                    lambda: f.read(1024 * 1024), b""
                ):
                    h.update(chunk)

            result["file_sha256"] = h.hexdigest()

            print(
                f"[VIDEO] File hash calculated in "
                f"{time.time() - hash_start:.1f}s",
                flush=True,
            )

            # Load or reuse detector.
            print("[VIDEO] Preparing detector...", flush=True)
            detector = _get_detector()

            # Run video inference.
            print(
                "[VIDEO] Starting inference. Please wait...",
                flush=True,
            )
            inference_start = time.time()

            verdict = detector.detect(p)

            inference_seconds = time.time() - inference_start

            print(
                f"[VIDEO] Inference completed in "
                f"{inference_seconds:.1f}s",
                flush=True,
            )

            from cakelens.data_types import Label

            scores = {
                label.value: float(score)
                for label, score in zip(
                    Label, verdict.predictions
                )
            }

            ai_score = max(
                0.0,
                min(1.0, scores.get("AI_GEN", 0.0)),
            )

            result.update({
                "ai_generation_score": ai_score,
                "ai_model_available": True,
                "model_architecture": "CakeLens v5",
                "frame_count": int(verdict.frame_count),
                "inference_time_seconds": round(
                    inference_seconds, 2
                ),
                "generator_scores": {
                    key: value
                    for key, value in scores.items()
                    if key != "AI_GEN"
                },
                "feature_summary": {
                    "frame_model_used": True,
                    "audio_video_sync_checked": False,
                    "model": "CakeLens v5",
                },
            })

            evidence.append({
                "id": "VID_EVID_CAKELENS_AI_GEN",
                "title": "AI-generated video model signal",
                "category": "AI Generation",
                "severity": (
                    "High" if ai_score >= 0.75
                    else "Medium" if ai_score >= 0.50
                    else "Informational"
                ),
                "description": (
                    f"CakeLens AI_GEN score: "
                    f"{ai_score * 100:.2f}%. "
                    "This is a model signal, not proof of authenticity."
                ),
                "technical_details": (
                    f"Frames reported by decoder: "
                    f"{verdict.frame_count}. "
                    f"Raw model score: {ai_score:.6f}. "
                    f"Inference time: {inference_seconds:.1f}s."
                ),
            })

            # Add the top three generator category scores.
            ranked = sorted(
                result["generator_scores"].items(),
                key=lambda item: item[1],
                reverse=True,
            )[:3]

            for label, score in ranked:
                evidence.append({
                    "id": f"VID_EVID_LABEL_{label}",
                    "title": f"CakeLens category: {label}",
                    "category": "AI Generation",
                    "severity": "Informational",
                    "description": (
                        f"Model score for {label}: "
                        f"{score * 100:.2f}%. "
                        "Category scores may overlap and are not proof "
                        "that a particular generator was used."
                    ),
                    "technical_details": (
                        f"Raw model score: {score:.6f}."
                    ),
                })

            # State limitations clearly.
            evidence.append({
                "id": "VID_EVID_MODEL_LIMITS",
                "title": "Video analysis limitations",
                "category": "Forensic Limitation",
                "severity": "Informational",
                "description": (
                    "CakeLens analyzes video frames. It does not establish "
                    "who created the video, verify provenance, or check "
                    "audio-video synchronization."
                ),
                "technical_details": (
                    "Manipulation detection and audio-video "
                    "synchronization are not provided by this integration."
                ),
            })

            print(
                f"[VIDEO] Final AI generation signal: "
                f"{ai_score * 100:.2f}%",
                flush=True,
            )

        except Exception as exc:
            logger.exception("CakeLens video analysis failed")

            result.update({
                "ai_model_available": False,
                "analysis_error": f"{type(exc).__name__}: {exc}",
                "score_semantics": (
                    "No valid model result was obtained. "
                    "The default score of zero must not be interpreted "
                    "as evidence that the video is real."
                ),
            })

            evidence.append({
                "id": "VID_EVID_MODEL_ERROR",
                "title": "Video model unavailable",
                "category": "System",
                "severity": "Informational",
                "description": (
                    "CakeLens could not complete the analysis. "
                    "No AI-generation verdict is available."
                ),
                "technical_details": result["analysis_error"],
            })

        return result, evidence
