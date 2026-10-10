"""Pellav2 audio deepfake detector: minimal inference code.

    pip install torch transformers soundfile numpy
    python pellav2_infer.py clip1.wav clip2.wav ...

The weights are downloaded from the Hugging Face Hub on first use. To run from a
local copy instead, pass it first: python pellav2_infer.py pellav2_detector.pt clip1.wav ...

Input: any wav readable by soundfile, ideally 16kHz mono (resample first if not).
Output per clip: probability that the clip is synthetic (higher means fake),
decision at the 0.5 threshold.
"""
import sys

import numpy as np
import soundfile as sf
import torch
import torch.nn as nn

SR = 16000
CROP = 4 * SR
HUB_REPO = "Sadanie/pellav2-audio-deepfake-detector"


class Detector(nn.Module):
    def __init__(self):
        super().__init__()
        from transformers import Wav2Vec2Model

        self.backbone = Wav2Vec2Model.from_pretrained("facebook/wav2vec2-xls-r-300m")
        self.fusion = True
        self.layer_weights = nn.Parameter(
            torch.zeros(self.backbone.config.num_hidden_layers + 1))
        self.head = nn.Linear(self.backbone.config.hidden_size, 1)

    def forward(self, x):
        hs = self.backbone(x, output_hidden_states=True).hidden_states
        w = torch.softmax(self.layer_weights, dim=0)
        h = torch.stack(hs).mul(w[:, None, None, None]).sum(0).mean(dim=1)
        return self.head(h).squeeze(-1)


def load_clip(path):
    wav, sr = sf.read(path, dtype="float32")
    if wav.ndim > 1:
        wav = wav.mean(axis=1)
    assert sr == SR, f"{path}: expected {SR}Hz, got {sr}Hz (resample first)"
    if len(wav) >= CROP:
        off = (len(wav) - CROP) // 2
        wav = wav[off: off + CROP]
    else:
        wav = np.pad(wav, (0, CROP - len(wav)))
    return (wav - wav.mean()) / (wav.std() + 1e-7)


def hub_weights():
    from huggingface_hub import hf_hub_download

    hf_hub_download(HUB_REPO, "config.json")
    return hf_hub_download(HUB_REPO, "pellav2_detector.pt")


def main():
    args = sys.argv[1:]
    if args and args[0].endswith(".pt"):
        weights, files = args[0], args[1:]
    else:
        weights, files = hub_weights(), args
    device = ("cuda" if torch.cuda.is_available()
              else "mps" if torch.backends.mps.is_available() else "cpu")
    model = Detector().to(device)
    model.load_state_dict(torch.load(weights, map_location=device))
    model.eval()
    with torch.no_grad():
        for f in files:
            x = torch.from_numpy(load_clip(f))[None].to(device)
            p = torch.sigmoid(model(x)).item()
            print(f"{f}: p_fake={p:.3f} -> {'FAKE' if p >= 0.5 else 'real'}")


if __name__ == "__main__":
    main()
