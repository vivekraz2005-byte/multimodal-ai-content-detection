import uuid
import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.models.store import store
from app.services.metadata_analyzer import MetadataAnalyzer
from app.services.provenance_analyzer import ProvenanceAnalyzer
from app.services.image_analyzer import ImageAnalyzer
from app.services.video_analyzer import VideoAnalyzer
from app.services.audio_analyzer import AudioAnalyzer
from app.services.document_analyzer import DocumentAnalyzer
from app.services.evidence_fusion import EvidenceFusionEngine

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(request: AnalysisRequest):
    upload_data = store.get_upload(request.file_id)
    if not upload_data:
        raise HTTPException(
            status_code=404,
            detail="File ID not found or session expired. Please re-upload your content."
        )

    file_path = Path(upload_data["target_path"])
    if not file_path.exists():
        raise HTTPException(
            status_code=404,
            detail="The uploaded file could not be located on disk."
        )

    media_type = upload_data["media_type"]
    original_filename = upload_data["original_filename"]

    try:
        # Step 1: Extract authentic metadata
        metadata = MetadataAnalyzer.analyze(file_path, media_type, original_filename)

        # Step 2: Extract provenance & C2PA content credentials
        provenance = ProvenanceAnalyzer.analyze(file_path, media_type)

        # Step 3: Execute media-specific analyzer
        if media_type == "image":
            media_results, raw_evidence = ImageAnalyzer.analyze(file_path, metadata)
        elif media_type == "video":
            media_results, raw_evidence = VideoAnalyzer.analyze(file_path, metadata)
        elif media_type == "audio":
            media_results, raw_evidence = AudioAnalyzer.analyze(file_path, metadata)
        elif media_type == "document":
            media_results, raw_evidence = DocumentAnalyzer.analyze(file_path, metadata)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported media type: {media_type}")

        # Step 4: Fuse all evidence channels
        fused = EvidenceFusionEngine.fuse(
            media_type=media_type,
            media_results=media_results,
            raw_evidence=raw_evidence,
            metadata=metadata,
            provenance=provenance
        )

        analysis_id = str(uuid.uuid4())
        analyzed_at = datetime.datetime.now().isoformat()

        response = AnalysisResponse(
            analysis_id=analysis_id,
            file_id=request.file_id,
            filename=original_filename,
            media_type=media_type,
            assessment=fused["assessment"],
            confidence=fused["confidence"],
            confidence_score=fused["confidence_score"],
            evidence_strength=fused["evidence_strength"],
            uncertainty=fused["uncertainty"],
            uncertainty_reasons=fused["uncertainty_reasons"],
            why_explanation=fused["why_explanation"],
            signals=fused["signals"],
            evidence_list=fused["evidence_list"],
            metadata=metadata,
            provenance=provenance,
            recommendations=fused["recommendations"],
            disclaimer=fused["disclaimer"],
            analyzed_at=analyzed_at
        )

        store.save_analysis(analysis_id, response.model_dump())
        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"We couldn't analyze this file. It may be corrupted or use an unsupported format. Error: {str(e)}"
        )

@router.get("/results/{analysis_id}", response_model=AnalysisResponse)
async def get_results(analysis_id: str):
    data = store.get_analysis(analysis_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis report '{analysis_id}' not found."
        )
    return AnalysisResponse(**data)
