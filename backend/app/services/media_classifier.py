
"""Extension allow-list plus signature checks; extension alone is not trusted."""

from pathlib import Path
from typing import Any, Dict, Tuple

from app.config import ALLOWED_EXTENSIONS
from app.utils.file_utils import get_mime_and_extension


SIGNATURES = {
    "image": [
        (b"\xff\xd8\xff", "JPEG"),
        (b"\x89PNG\r\n\x1a\n", "PNG"),
        (b"GIF87a", "GIF"),
        (b"GIF89a", "GIF"),
    ],
    "video": [
        (b"\x1aE\xdf\xa3", "EBML/WebM/Matroska"),
    ],
    "audio": [
        (b"ID3", "MP3/ID3"),
        (b"fLaC", "FLAC"),
        (b"OggS", "Ogg"),
        (b"RIFF", "RIFF audio container"),
        (b"#!AMR\n", "AMR"),
        (b"#!AMR-WB\n", "AMR-WB"),
    ],
    "document": [
        (b"%PDF", "PDF"),
        (b"PK\x03\x04", "ZIP/OOXML"),
    ],
}


def _has_mpeg_audio_sync(header: bytes) -> bool:
    """Check for an MPEG audio frame sync in a header prefix."""
    for i in range(len(header) - 1):
        if (
            header[i] == 0xFF
            and (header[i + 1] & 0xE0) == 0xE0
            and (header[i + 1] & 0x06) != 0
        ):
            return True
    return False


class MediaClassifier:

    @staticmethod
    def classify(
        file_path: Path,
        original_filename: str,
    ) -> Tuple[str, str, Dict[str, Any]]:

        path = Path(file_path)
        mime, ext = get_mime_and_extension(original_filename)
        ext = ext.lower()

        # Determine the category from the approved extension list.
        kind = next(
            (
                category
                for category, extensions in ALLOWED_EXTENSIONS.items()
                if ext in extensions
            ),
            None,
        )

        if not kind:
            raise ValueError(
                f"Unsupported file extension: {ext}"
            )

        if not path.is_file() or path.stat().st_size == 0:
            raise ValueError("File is missing or empty")

        with path.open("rb") as f:
            header = f.read(64)

        found = next(
            (
                label
                for signature, label in SIGNATURES.get(kind, [])
                if header.startswith(signature)
            ),
            None,
        )

        # Validate common video container headers.
        if kind == "video":
            if len(header) >= 12 and header[4:8] == b"ftyp":
                found = "ISO Base Media (MP4/MOV)"
            elif (
                header.startswith(b"RIFF")
                and header[8:12] == b"AVI "
            ):
                found = "AVI"

        # Validate common image and audio containers.
        if (
            kind == "image"
            and header.startswith(b"RIFF")
            and header[8:12] == b"WEBP"
        ):
            found = "WEBP"

        if (
            kind == "audio"
            and header.startswith(b"RIFF")
            and header[8:12] == b"WAVE"
        ):
            found = "WAVE"

        # WhatsApp .mpeg/.mpga audio may contain an ID3 tag
        # or start directly with MPEG audio frames.
        if (
            kind == "audio"
            and ext in {".mp3", ".mpeg", ".mpga"}
            and not found
            and _has_mpeg_audio_sync(header)
        ):
            found = "MPEG audio frame sync"

        # AAC ADTS audio.
        if (
            kind == "audio"
            and ext == ".aac"
            and not found
            and len(header) >= 2
            and header[0] == 0xFF
            and (header[1] & 0xF6) == 0xF0
        ):
            found = "AAC ADTS"

        # M4A and 3GP use the ISO Base Media container.
        if (
            kind == "audio"
            and ext in {".m4a", ".3gp"}
            and len(header) >= 12
            and header[4:8] == b"ftyp"
        ):
            found = "ISO Base Media audio container"

        if kind == "document" and ext == ".txt":
            try:
                header.decode("utf-8")
                found = "UTF-8 text (prefix only)"
            except UnicodeDecodeError:
                found = None

        if not found:
            raise ValueError(
                f"File content signature does not match a supported "
                f"{kind} format (extension {ext})."
            )

        # Windows may identify .mpeg as video/mpeg even when the
        # file contains MP3 audio. Override MIME for these extensions.
        if ext in {".mp3", ".mpeg", ".mpga"}:
            mime = "audio/mpeg"

        return kind, mime, {
            "magic_match": True,
            "header_signature": found,
            "validated_by": (
                "header signature only; full decoder "
                "validation occurs later"
            ),
        }
