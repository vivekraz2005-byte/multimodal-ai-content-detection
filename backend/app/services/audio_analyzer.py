
"""Pellav2-based audio deepfake screening with metadata evidence."""

from pathlib import Path
from typing import Any, Dict, List, Tuple
import hashlib
import logging
import threading

import numpy as np
import soundfile as sf
import torch
import torch.nn as nn
from scipy.signal import resample_poly

logger = logging.getLogger(__name__)

SR = 16000
CROP = 4 * SR
MODEL_DIR = (
    Path(__file__).resolve().parents[2]
    / "model_files"
    / "audio"
    / "pellav2"
)
WEIGHTS_PATH = MODEL_DIR / "pellav2_detector.pt"

SYNTH_TERMS = (
    "elevenlabs", "play.ht", "playht", "resemble ai",
    "coqui tts", "text-to-speech", "text to speech",
)

_model = None
_model_lock = threading.Lock()


class Detector(nn.Module):
    def __init__(self):
        super().__init__()
        from transformers import Wav2Vec2Model

        self.backbone = Wav2Vec2Model.from_pretrained(
            "facebook/wav2vec2-xls-r-300m"
        )
        self.layer_weights = nn.Parameter(
            torch.zeros(self.backbone.config.num_hidden_layers + 1)
        )
        self.head = nn.Linear(self.backbone.config.hidden_size, 1)

    def forward(self, x):
        hidden_states = self.backbone(
            x, output_hidden_states=True
        ).hidden_states

        weights = torch.softmax(self.layer_weights, dim=0)
        combined = (
            torch.stack(hidden_states)
            .mul(weights[:, None, None, None])
            .sum(0)
            .mean(dim=1)
        )
        return self.head(combined).squeeze(-1)


def _get_model():
    global _model

    with _model_lock:
        if _model is None:
            if not WEIGHTS_PATH.is_file():
                raise FileNotFoundError(
                    f"Pellav2 weights not found: {WEIGHTS_PATH}"
                )

            device = torch.device(
                "cuda" if torch.cuda.is_available() else "cpu"
            )

            model = Detector()

            state = torch.load(
                WEIGHTS_PATH,
                map_location="cpu",
                weights_only=True,
            )
            model.load_state_dict(state)
            model.to(device)
            model.eval()
            _model = (model, device)

    return _model


def _prepare_audio(file_path: Path) -> np.ndarray:
    audio, sample_rate = sf.read(
        str(file_path), dtype="float32", always_2d=False
    )

    if audio.size == 0:
        raise ValueError("Audio file contains no samples.")

    if audio.ndim == 2:
        audio = audio.mean(axis=1)
    elif audio.ndim != 1:
        raise ValueError("Unsupported audio channel layout.")

    if not np.isfinite(audio).all():
        raise ValueError("Audio contains invalid numeric samples.")

    if sample_rate <= 0:
        raise ValueError("Invalid audio sample rate.")

    if sample_rate != SR:
        from math import gcd

        divisor = gcd(int(sample_rate), SR)
        audio = resample_poly(
            audio,
            SR // divisor,
            int(sample_rate) // divisor,
        ).astype(np.float32)

    if len(audio) >= CROP:
        offset = (len(audio) - CROP) // 2
        audio = audio[offset:offset + CROP]
    else:
        audio = np.pad(audio, (0, CROP - len(audio)))

    audio = audio.astype(np.float32)
    audio = (audio - audio.mean()) / (audio.std() + 1e-7)

    return audio


def _predict(file_path: Path) -> float:
    model, device = _get_model()
    audio = _prepare_audio(file_path)
    tensor = torch.from_numpy(audio).unsqueeze(0).to(device)

    with torch.inference_mode():
        logit = model(tensor)
        score = torch.sigmoid(logit).item()

    if not np.isfinite(score):
        raise ValueError("Pellav2 returned a non-finite score.")

    return float(max(0.0, min(1.0, score)))


class AudioAnalyzer:
    @staticmethod
    def analyze(
        file_path: Path,
        metadata: Dict[str, Any],
    ) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        path = Path(file_path)
        evidence: List[Dict[str, Any]] = []

        result = {
            "ai_generation_score": 0.0,
            "manipulation_score": 0.0,
            "ai_model_available": False,
            "manipulation_model_available": False,
            "score_semantics": (
                "Pellav2 synthetic-audio model score; not a calibrated "
                "probability or proof of AI generation."
            ),
            "model_architecture": "Pellav2 / XLS-R-300M",
            "file_sha256": None,
        }

        if not path.is_file():
            result["analysis_error"] = "Audio file unavailable"
            evidence.append({
                "id": "AUD_EVID_ERROR",
                "title": "Audio file unavailable",
                "category": "System",
                "severity": "Informational",
                "description": "The audio file could not be found.",
                "technical_details": str(path),
            })
            return result, evidence

        try:
            digest = hashlib.sha256()
            with path.open("rb") as stream:
                for chunk in iter(
                    lambda: stream.read(1024 * 1024), b""
                ):
                    digest.update(chunk)
            result["file_sha256"] = digest.hexdigest()

            encoder = str(metadata.get("Encoder", "Not available"))
            title = str(metadata.get("Title", ""))
            comment = str(metadata.get("Comment", ""))
            marker = next(
                (
                    term for term in SYNTH_TERMS
                    if term in f"{encoder} {title} {comment}".lower()
                ),
                None,
            )

            try:
                score = _predict(path)
                result.update({
                    "ai_generation_score": score,
                    "ai_model_available": True,
                    "feature_summary": {
                        "trained_detector_used": True,
                        "model": "Pellav2",
                        "model_score": round(score, 6),
                        "sample_rate_used": SR,
                        "audio_window_seconds": 4,
                        "metadata_marker": bool(marker),
                    },
                })

                label = "higher" if score >= 0.5 else "lower"
                evidence.append({
                    "id": "AUD_EVID_PELLAV2",
                    "title": "Pellav2 synthetic-audio screening",
                    "category": "AI Generation",
                    "severity": "Medium" if score >= 0.5 else "Informational",
                    "description": (
                        f"Pellav2 returned a synthetic-audio score of "
                        f"{score * 100:.2f}%. This is a model score, not "
                        "a calibrated probability. It does not prove "
                        "whether the recording is real or AI-generated."
                    ),
                    "technical_details": (
                        f"Model=Pellav2; score={score:.6f}; "
                        f"threshold=0.5; score is {label} relative to "
                        "the model's screening threshold; "
                        "input converted to mono, 16 kHz, 4 seconds."
                    ),
                })

            except Exception as exc:
                logger.exception("Pellav2 inference failed")
                result["analysis_error"] = (
                    f"{type(exc).__name__}: {exc}"
                )
                evidence.append({
                    "id": "AUD_EVID_MODEL_ERROR",
                    "title": "Audio AI model unavailable",
                    "category": "System",
                    "severity": "Informational",
                    "description": (
                        "Pellav2 inference failed. No AI-detection verdict "
                        "is available for this file."
                    ),
                    "technical_details": result["analysis_error"],
                })

            if marker:
                evidence.append({
                    "id": "AUD_EVID_SYNTH_TAG",
                    "title": "Possible synthetic-audio metadata marker",
                    "category": "AI Generation",
                    "severity": "Medium",
                    "description": (
                        f"Metadata contains '{marker}', a term associated "
                        "with speech synthesis. Tags can be forged or "
                        "copied and do not prove AI generation."
                    ),
                    "technical_details": f"Encoder={encoder[:300]}",
                })
            else:
                evidence.append({
                    "id": "AUD_EVID_NO_SYNTH_TAG",
                    "title": "No explicit synthesis marker found",
                    "category": "Metadata",
                    "severity": "Informational",
                    "description": (
                        "No known synthesis marker was found in the "
                        "inspected metadata. Its absence does not prove "
                        "the audio is genuine."
                    ),
                    "technical_details": f"Encoder={encoder[:300]}",
                })

        except Exception as exc:
            logger.exception("Audio analysis failed")
            result["analysis_error"] = f"{type(exc).__name__}: {exc}"
            evidence.append({
                "id": "AUD_EVID_ERROR",
                "title": "Audio inspection failed",
                "category": "System",
                "severity": "Informational",
                "description": (
                    "The audio could not be inspected reliably."
                ),
                "technical_details": result["analysis_error"],
            })

        return result, evidence