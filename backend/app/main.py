import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import APP_NAME, APP_VERSION, UPLOAD_DIR
from app.routes import health, upload, analyze, metadata, history

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Multimodal AI Detection & Digital Authenticity Assistant API"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory for preview serving
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Include API routes under /api
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(analyze.router, prefix="/api", tags=["Analyze"])
app.include_router(metadata.router, prefix="/api", tags=["Metadata"])
app.include_router(history.router, prefix="/api", tags=["History"])

# Global user-friendly exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Processing Error",
            "message": "We couldn't analyze this file. It may be corrupted or use an unsupported format.",
            "detail": str(exc)
        }
    )

@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "api": "/api/health"
    }
