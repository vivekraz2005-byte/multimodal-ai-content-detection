"""Video metadata screening. This module does not claim frame-level deepfake detection."""
from pathlib import Path
from typing import Any, Dict, List, Tuple
import hashlib, logging
logger=logging.getLogger(__name__)
TERMS=("runway", "pika labs", "pika", "sora", "deforum", "animatediff", "stable-video", "kling ai", "luma dream machine")
class VideoAnalyzer:
    @staticmethod
    def analyze(file_path: Path, metadata: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        p=Path(file_path); evidence: List[Dict[str, Any]]=[]
        result={"ai_generation_score":0.0,"manipulation_score":0.0,"ai_model_available":False,"manipulation_model_available":False,"score_semantics":"No validated video-generation/deepfake model configured; scores are not probabilities.","model_architecture":"Container metadata screening only; no frame/audio model inference","file_sha256":None}
        try:
            if not p.is_file(): raise FileNotFoundError(str(p))
            h=hashlib.sha256(); sample=bytearray()
            with p.open('rb') as f:
                while True:
                    chunk=f.read(1024*1024)
                    if not chunk: break
                    h.update(chunk)
                    if len(sample)<2*1024*1024: sample.extend(chunk[:2*1024*1024-len(sample)])
            result['file_sha256']=h.hexdigest()
            blob=bytes(sample).lower(); enc=str(metadata.get('Encoding Tool','Not available'))
            found=next((t for t in TERMS if t.encode() in blob),None)
            if found:
                evidence.append({"id":"VID_EVID_SYNTH_TAG","title":"Possible video-generator metadata marker","category":"AI Generation","severity":"Medium","description":f"A string associated with a video-generation tool ({found}) appears in the sampled file bytes. This is not cryptographic proof and can be copied or forged.","technical_details":"Scanned at most the first 2 MiB; metadata may be elsewhere or absent."})
            else:
                evidence.append({"id":"VID_EVID_NO_SYNTH_TAG","title":"No explicit generator marker found","category":"Metadata","severity":"Informational","description":"No known generator marker was found in the sampled bytes. No conclusion about whether the video is AI-generated can be made from this alone.","technical_details":"No decoded frames, facial regions, optical flow or audio/video sync were analyzed."})
            evidence.append({"id":"VID_EVID_ANALYSIS_LIMIT","title":"Frame-level analysis not configured","category":"Forensic Limitation","severity":"Informational","description":"This run did not extract and classify video frames or run a deepfake model. Container/encoder metadata cannot establish authenticity.","technical_details":f"Extension={p.suffix.lower()}; encoding tool={enc}; file bytes hashed with SHA-256."})
            result.update({"ai_marker_found":bool(found),"feature_summary":{"metadata_marker":bool(found),"frame_model_used":False,"audio_video_sync_checked":False}})
        except Exception as exc:
            logger.exception('Video analysis failed')
            result['analysis_error']=f'{type(exc).__name__}: {exc}'
            evidence.append({"id":"VID_EVID_ERROR","title":"Video inspection failed","category":"System","severity":"Informational","description":"The file could not be inspected reliably; no AI verdict is available.","technical_details":result['analysis_error']})
        return result,evidence
