
import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import (
    APP_NAME,
    APP_VERSION,
    UPLOAD_DIR,
    FRONTEND_ORIGINS,
)
from app.routes import health, upload, analyze, metadata, history


# --------------------------------------------------
# Logging configuration
# --------------------------------------------------

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=(
        "Multimodal AI Detection & Digital Authenticity "
        "Assistant API"
    ),
)


# --------------------------------------------------
# CORS configuration
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


# --------------------------------------------------
# Upload directory
# --------------------------------------------------

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads",
)


# --------------------------------------------------
# API routes
# --------------------------------------------------

app.include_router(
    health.router,
    prefix="/api",
    tags=["Health"],
)

app.include_router(
    upload.router,
    prefix="/api",
    tags=["Upload"],
)

app.include_router(
    analyze.router,
    prefix="/api",
    tags=["Analyze"],
)

app.include_router(
    metadata.router,
    prefix="/api",
    tags=["Metadata"],
)

app.include_router(
    history.router,
    prefix="/api",
    tags=["History"],
)


# --------------------------------------------------
# Global exception handler
# --------------------------------------------------

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    logger.exception(
        "Unhandled server error on %s %s",
        request.method,
        request.url.path,
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "Processing Error",
            "message": (
                "The server could not process this request. "
                "Check the backend logs for details."
            ),
        },
    )


# --------------------------------------------------
# Root endpoint
# --------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "api": "/api/health",
    }
