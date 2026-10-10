
import os
from pathlib import Path

# backend/app/config.py -> backend/
BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB

ALLOWED_EXTENSIONS = {
    "image": {".jpg", ".jpeg", ".png", ".webp"},
    "video": {".mp4", ".mov", ".avi", ".webm"},
    "audio": {
        ".mp3", ".mpeg", ".mpga", ".wav", ".m4a",
        ".flac", ".ogg", ".aac", ".opus", ".amr", ".3gp"
    },
    "document": {".pdf", ".docx", ".txt"},
}

ALL_ALLOWED_EXTENSIONS = set().union(
    *ALLOWED_EXTENSIONS.values()
)

APP_NAME = (
    "AuthenticityAI - Multimodal Digital Authenticity Assistant"
)
APP_VERSION = "1.0.0"

# Heuristic mode: no validated detection model is configured.
DEMO_MODE = True

# For local React development, defaults to Vite's usual port.
_frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://localhost:5174",
)

FRONTEND_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in _frontend_origins.split(",")
    if origin.strip()
]
