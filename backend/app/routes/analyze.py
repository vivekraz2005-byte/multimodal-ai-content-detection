import uuid
import datetime
import logging
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

# Set up logging for professional debugging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(request: AnalysisRequest):
    logger.info(f"Starting analysis for file_id: {request.file_id}")
    
    # 1. Retrieve upload session
    upload_data = store.get_upload(request.file_id)
    if not upload_data:
        logger.warning(f"File ID {request.file_id} not found in store.")
        raise HTTPException(
            status_code=404,
            detail="File ID not found or session expired. Please re-upload your content."
        )

    logger.info(f"Upload data retrieved successfully. Keys found: {list(upload_data.keys())}")

    # 2. Robust File Path Resolution (Handles all key variations safely)
    path_str = (
        upload_data.get("target_path") or 
        upload_data.get("file_path") or 
        upload_data.get("path") or
        upload_data.get("filename")
    )
    
    if not path_str:
        logger.error(f"No path or filename found in upload_data: {upload_data}")
        raise HTTPException(
            status_code=500,
            detail="Internal Error: The server lost track of the file location."
        )

    file_path = Path(path_str)
    
    # If file_path is not absolute or doesn't exist directly, check common upload folders
    if not file_path.exists():
        possible_dirs = [
            Path("uploads"),
            Path("app/uploads"),
            Path("../uploads"),
            Path("backend/uploads"),
            Path.cwd() / "uploads"
        ]
        
        resolved_path = None
        for d in possible_dirs:
            candidate = d / Path(path_str).name
            if candidate.exists():
                resolved_path = candidate
                break
                
        if resolved_path:
            file_path = resolved_path
        else:
            logger.error(f"File not found on disk. Tried path: {file_path} and fallback directories.")
            raise HTTPException(
                status_code=404,
                detail=f"The uploaded file could not be located on disk at {path_str}."
            )

    # 3. Extract basic metadata
    media_type = upload_data.get("media_type", "unknown")
    original_filename = upload_data.get("original_filename", upload_data.get("filename", "unknown_file"))

    try:
        # Step 1: Extract authentic metadata
        logger.info("Extracting metadata...")
        metadata = MetadataAnalyzer.analyze(file_path, media_type, original_filename)

        # Step 2: Extract provenance & C2PA content credentials
        logger.info("Extracting provenance...")
        provenance = ProvenanceAnalyzer.analyze(file_path, media_type)

        # Step 3: Execute media-specific analyzer
        logger.info(f"Running specific analyzer for media_type: {media_type}")
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
        logger.info("Fusing evidence...")
        fused = EvidenceFusionEngine.fuse(
            media_type=media_type,
            media_results=media_results,
            raw_evidence=raw_evidence,
            metadata=metadata,
            provenance=provenance
        )

        # Step 5: Format and store response
        analysis_id = str(uuid.uuid4())
        analyzed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        response = AnalysisResponse(
            analysis_id=analysis_id,
            file_id=request.file_id,
            filename=original_filename,
            media_type=media_type,
            assessment=fused.get("assessment", "Unknown"),
            confidence=fused.get("confidence", "Low"),
            confidence_score=fused.get("confidence_score", 0.0),
            evidence_strength=fused.get("evidence_strength", "Weak"),
            uncertainty=fused.get("uncertainty", False),
            uncertainty_reasons=fused.get("uncertainty_reasons", []),
            why_explanation=fused.get("why_explanation", "No explanation provided."),
            signals=fused.get("signals", []),
            evidence_list=fused.get("evidence_list", []),
            metadata=metadata,
            provenance=provenance,
            recommendations=fused.get("recommendations", []),
            disclaimer=fused.get("disclaimer", "Results are for informational purposes."),
            analyzed_at=analyzed_at
        )

        # Save to store for future retrieval
        store.save_analysis(analysis_id, response.model_dump())
        logger.info(f"Analysis complete. ID: {analysis_id}")
        
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Fatal error during analysis of {original_filename}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"We couldn't analyze this file. Error: {str(e)}"
        )


@router.get("/results/{analysis_id}", response_model=AnalysisResponse)
async def get_results(analysis_id: str):
    logger.info(f"Fetching results for analysis_id: {analysis_id}")
    
    data = store.get_analysis(analysis_id)
    if not data:
        logger.warning(f"Analysis report '{analysis_id}' not found in store.")
        raise HTTPException(
            status_code=404,
            detail=f"Analysis report '{analysis_id}' not found."
        )
        
    return AnalysisResponse(**data)