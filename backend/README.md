# AuthenticityAI - Backend Engine

FastAPI-powered backend implementing multimodal forensic signal extraction, metadata parsing, provenance scanning, and evidence fusion.

## Quick Start
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## Running Tests
```powershell
.\venv\Scripts\pytest.exe -v
```
## AI Image Detector Setup

The AI image detector requires a model checkpoint that is not stored in GitHub because of its large size.

### Install dependencies

Run these commands from the `backend` directory in PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r requirements.txt
```

### Download the AI model

From the project root directory, run:

```powershell
python backend\scripts\download_model.py
```

The checkpoint will be saved to:

`backend/model_files/checkpoints/checkpoint_phase2.pth`

You need an internet connection and approximately 1–2 GB of free disk space.

### Start the backend

From the `backend` directory:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open the API documentation at http://127.0.0.1:8000/docs.

**Note:** The first model download may take several minutes. AI detection requires the checkpoint to be present locally.
