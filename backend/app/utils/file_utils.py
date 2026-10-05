import os
import mimetypes
from pathlib import Path
from typing import Tuple, Optional

MAGIC_NUMBERS = {
    b"\xFF\xD8\xFF": ("image", "image/jpeg", ".jpg"),
    b"\x89PNG\r\n\x1a\n": ("image", "image/png", ".png"),
    b"RIFF": ("riff_container", "image/webp_or_audio", ""),  # Can be WEBP, WAV, or AVI
    b"%PDF": ("document", "application/pdf", ".pdf"),
    b"PK\x03\x04": ("document_or_zip", "application/vnd.openxmlformats-officedocument", ".docx"),
    b"ID3": ("audio", "audio/mpeg", ".mp3"),
    b"\xFF\xFB": ("audio", "audio/mpeg", ".mp3"),
    b"\xFF\xF3": ("audio", "audio/mpeg", ".mp3"),
    b"fLaC": ("audio", "audio/flac", ".flac"),
    b"OggS": ("audio", "audio/ogg", ".ogg"),
}

def format_bytes(size: int) -> str:
    """Formats raw byte count into human readable units."""
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.1f} KB"
    elif size < 1024 * 1024 * 1024:
        return f"{size / (1024 * 1024):.2f} MB"
    else:
        return f"{size / (1024 * 1024 * 1024):.2f} GB"

def get_mime_and_extension(filename: str) -> Tuple[str, str]:
    ext = Path(filename).suffix.lower()
    mime, _ = mimetypes.guess_type(filename)
    if not mime:
        ext_map = {
            ".webp": "image/webp",
            ".mp4": "video/mp4",
            ".mov": "video/quicktime",
            ".webm": "video/webm",
            ".avi": "video/x-msvideo",
            ".m4a": "audio/mp4",
            ".flac": "audio/flac",
            ".ogg": "audio/ogg",
            ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".pdf": "application/pdf",
            ".txt": "text/plain"
        }
        mime = ext_map.get(ext, "application/octet-stream")
    return mime, ext
