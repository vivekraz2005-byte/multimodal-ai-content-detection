from pathlib import Path
from urllib.request import urlretrieve

MODEL_DIR = Path(__file__).resolve().parents[1] / "model_files"
CHECKPOINT_DIR = MODEL_DIR / "checkpoints"
CHECKPOINT_PATH = CHECKPOINT_DIR / "checkpoint_phase2.pth"

MODEL_URL = (
    "https://huggingface.co/xRayon/convnext-ai-images-detector/"
    "resolve/main/AI%20Images%20Detector/checkpoints/checkpoint_phase2.pth"
)


def main():
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)

    if CHECKPOINT_PATH.exists() and CHECKPOINT_PATH.stat().st_size > 100_000_000:
        print(f"Model already exists: {CHECKPOINT_PATH}")
        return

    print("Downloading AI image detector model (~1 GB)...")

    try:
        urlretrieve(MODEL_URL, CHECKPOINT_PATH)
        print(f"Download complete: {CHECKPOINT_PATH}")
    except Exception as exc:
        if CHECKPOINT_PATH.exists():
            CHECKPOINT_PATH.unlink()
        print(f"Download failed: {exc}")
        raise SystemExit(1)


if __name__ == "__main__":
    main()