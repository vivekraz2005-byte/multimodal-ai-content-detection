import io
import sys
import wave
import struct
import math
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "AuthenticityAI" in data["app"]

def test_upload_and_analyze_image():
    # Create sample in-memory PNG image
    img = Image.new("RGB", (256, 256), color=(40, 90, 200))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    # 1. Upload
    upload_res = client.post(
        "/api/upload",
        files={"file": ("sample_test_image.png", buf, "image/png")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["media_type"] == "image"
    file_id = upload_data["file_id"]

    # 2. Analyze
    analyze_res = client.post("/api/analyze", json={"file_id": file_id})
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert "analysis_id" in analysis
    assert analysis["media_type"] == "image"
    assert "assessment" in analysis
    assert "signals" in analysis
    assert "evidence_list" in analysis
    assert "metadata" in analysis
    assert "provenance" in analysis
    assert len(analysis["evidence_list"]) > 0

    # 3. Retrieve results
    analysis_id = analysis["analysis_id"]
    get_res = client.get(f"/api/results/{analysis_id}")
    assert get_res.status_code == 200
    assert get_res.json()["analysis_id"] == analysis_id

def test_upload_and_analyze_audio():
    # Create 1-second sample WAV audio
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(22050)
        # 440 Hz tone
        for i in range(22050):
            value = int(32767.0 * 0.5 * math.sin(2.0 * math.pi * 440.0 * i / 22050))
            wf.writeframes(struct.pack('<h', value))
    buf.seek(0)

    upload_res = client.post(
        "/api/upload",
        files={"file": ("synth_tone_22k.wav", buf, "audio/wav")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["media_type"] == "audio"

    analyze_res = client.post("/api/analyze", json={"file_id": upload_data["file_id"]})
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert analysis["media_type"] == "audio"
    assert "Sample Rate" in analysis["metadata"]

def test_upload_and_analyze_document():
    # Create sample text document
    buf = io.BytesIO(b"AuthenticityAI Document Forensics Test Payload.\nThis is a second verified line of evidence.")
    upload_res = client.post(
        "/api/upload",
        files={"file": ("report_sample.txt", buf, "text/plain")}
    )
    assert upload_res.status_code == 200
    upload_data = upload_res.json()
    assert upload_data["media_type"] == "document"

    analyze_res = client.post("/api/analyze", json={"file_id": upload_data["file_id"]})
    assert analyze_res.status_code == 200
    analysis = analyze_res.json()
    assert analysis["media_type"] == "document"
    assert "Line Count" in analysis["metadata"]

def test_history_endpoint():
    res = client.get("/api/history")
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) >= 3
