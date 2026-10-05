from fastapi import APIRouter, HTTPException
from app.models.store import store

router = APIRouter()

@router.get("/metadata/{analysis_id}")
async def get_metadata(analysis_id: str):
    data = store.get_analysis(analysis_id)
    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"Analysis report '{analysis_id}' not found."
        )
    return {
        "analysis_id": analysis_id,
        "filename": data.get("filename"),
        "media_type": data.get("media_type"),
        "metadata": data.get("metadata", {})
    }
