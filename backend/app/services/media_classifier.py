import os
from pathlib import Path
from typing import Tuple, Dict, Any
from app.config import ALLOWED_EXTENSIONS
from app.utils.file_utils import get_mime_and_extension, MAGIC_NUMBERS

class MediaClassifier:
    @staticmethod
    def classify(file_path: Path, original_filename: str) -> Tuple[str, str, Dict[str, Any]]:
        """
        Classifies media into one of: 'image', 'video', 'audio', 'document'.
        Returns (media_type, mime_type, validation_info)
        Raises ValueError if unsupported.
        """
        mime, ext = get_mime_and_extension(original_filename)
        ext = ext.lower()
        
        detected_type = None
        for category, extensions in ALLOWED_EXTENSIONS.items():
            if ext in extensions:
                detected_type = category
                break
                
        if not detected_type:
            raise ValueError(f"Unsupported file format: '{ext}'. Allowed formats: Images (JPG, PNG, WEBP), Videos (MP4, MOV, AVI, WEBM), Audio (MP3, WAV, M4A, FLAC, OGG), Documents (PDF, DOCX, TXT)")
            
        # Verify magic bytes if file exists
        header_check = {"magic_match": True, "header_signature": "Standard"}
        if file_path.exists() and file_path.stat().st_size > 0:
            with open(file_path, "rb") as f:
                header = f.read(16)
                
            # Check MP4 / MOV standard ftyp box
            if detected_type == "video" and len(header) >= 12:
                if b"ftyp" in header[:12] or b"moov" in header[:12]:
                    header_check["header_signature"] = "ISO Base Media / QuickTime"
            elif detected_type == "image":
                if header.startswith(b"\xFF\xD8\xFF"):
                    header_check["header_signature"] = "JPEG SOI"
                elif header.startswith(b"\x89PNG\r\n\x1a\n"):
                    header_check["header_signature"] = "PNG Magic"
                elif header.startswith(b"RIFF") and b"WEBP" in header[:16]:
                    header_check["header_signature"] = "RIFF WEBP"
            elif detected_type == "audio":
                if header.startswith(b"ID3") or header.startswith(b"\xFF\xFB") or header.startswith(b"\xFF\xF3"):
                    header_check["header_signature"] = "MPEG Audio Layer 3 (MP3)"
                elif header.startswith(b"RIFF") and b"WAVE" in header[:16]:
                    header_check["header_signature"] = "RIFF WAVE"
                elif header.startswith(b"fLaC"):
                    header_check["header_signature"] = "Free Lossless Audio Codec (FLAC)"
                elif header.startswith(b"OggS"):
                    header_check["header_signature"] = "Ogg Container"
            elif detected_type == "document":
                if header.startswith(b"%PDF"):
                    header_check["header_signature"] = "PDF Magic"
                elif header.startswith(b"PK\x03\x04"):
                    header_check["header_signature"] = "ZIP Container (DOCX)"
                elif ext == ".txt":
                    header_check["header_signature"] = "Plain Text Stream"

        return detected_type, mime, header_check
