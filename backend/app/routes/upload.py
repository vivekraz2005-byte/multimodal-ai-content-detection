import uuid
import datetime
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import UPLOAD_DIR, MAX_CONTENT_LENGTH, ALL_ALLOWED_EXTENSIONS
from app.services.media_classifier import MediaClassifier
from app.utils.file_utils import format_bytes, get_mime_and_extension
from app.schemas.analysis import UploadResponse
from app.models.store import store

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    original_filename = file.filename
    ext = Path(original_filename).suffix.lower()

    if ext not in ALL_ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: Images (JPG, PNG, WEBP), Videos (MP4, MOV, AVI, WEBM), Audio (MP3, WAV, M4A, FLAC, OGG), Documents (PDF, DOCX, TXT)."
        )

    file_id = str(uuid.uuid4())
    safe_filename = f"{file_id}{ext}"
    target_path = UPLOAD_DIR / safe_filename

    # Save content with size limit check
    try:
        size = 0
        with open(target_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):  # 1MB chunks
                size += len(chunk)
                if size > MAX_CONTENT_LENGTH:
                    buffer.close()
                    if target_path.exists():
                        target_path.unlink()
                    raise HTTPException(
                        status_code=413,
                        detail="File is too large. Maximum supported file size is 100 MB."
                    )
                buffer.write(chunk)

        # Classify media
        media_type, mime_type, _ = MediaClassifier.classify(target_path, original_filename)

        preview_url = f"/uploads/{safe_filename}" if media_type in ("image", "video", "audio") else None

        upload_data = {
            "file_id": file_id,
            "filename": safe_filename,
            "original_filename": original_filename,
            "media_type": media_type,
            "file_size_bytes": size,
            "file_size_formatted": format_bytes(size),
            "mime_type": mime_type,
            "target_path": str(target_path),
            "preview_url": preview_url,
            "upload_timestamp": datetime.datetime.now().isoformat()
        }

        store.save_upload(file_id, upload_data)

        return UploadResponse(
            file_id=file_id,
            filename=safe_filename,
            original_filename=original_filename,
            media_type=media_type,
            file_size_bytes=size,
            file_size_formatted=format_bytes(size),
            mime_type=mime_type,
            preview_url=preview_url,
            upload_timestamp=upload_data["upload_timestamp"]
        )

    except HTTPException:
        raise
    except Exception as e:
        if target_path.exists():
            target_path.unlink()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process and store uploaded file: {str(e)}"
        )
