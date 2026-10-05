import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MB max file size

ALLOWED_EXTENSIONS = {
    "image": {".jpg", ".jpeg", ".png", ".webp"},
    "video": {".mp4", ".mov", ".avi", ".webm"},
    "audio": {".mp3", ".wav", ".m4a", ".flac", ".ogg"},
    "document": {".pdf", ".docx", ".txt"}
}

ALL_ALLOWED_EXTENSIONS = set().union(*ALLOWED_EXTENSIONS.values())

APP_NAME = "AuthenticityAI - Multimodal Digital Authenticity Assistant"
APP_VERSION = "1.0.0"
DEMO_MODE = True  # Clearly labeled modular demo/heuristic engine with plug-in ML hooks
