from fastapi import APIRouter
from app.config import APP_NAME, APP_VERSION, DEMO_MODE

router = APIRouter()

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "app": APP_NAME,
        "version": APP_VERSION,
        "demo_mode": DEMO_MODE,
        "message": "Multimodal AI Detection & Digital Authenticity Engine active and ready."
    }
