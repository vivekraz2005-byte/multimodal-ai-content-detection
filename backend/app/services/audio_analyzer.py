"""Audio file inspection. Sample rate, mono/stereo and encoder are not AI detectors."""
from pathlib import Path
from typing import Any, Dict, List, Tuple
import hashlib, logging
logger = logging.getLogger(__name__)
SYNTH_TERMS = ("elevenlabs", "play.ht", "playht", "resemble ai", "coqui tts", "text-to-speech", "text to speech", "synthetic speech")
class AudioAnalyzer:
    @staticmethod
    def analyze(file_path: Path, metadata: Dict[str, Any]) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
        p=Path(file_path); evidence: List[Dict[str, Any]]=[]
        result={"ai_generation_score":0.0,"manipulation_score":0.0,"ai_model_available":False,"manipulation_model_available":False,"score_semantics":"No calibrated synthetic-audio classifier configured; scores are not probabilities.","model_architecture":"Metadata screening only; no audio ML inference","file_sha256":None}
        if not p.is_file():
            evidence.append({"id":"AUD_EVID_ERROR","title":"Audio file unavailable","category":"System","severity":"Informational","description":"The file path does not point to a readable file.","technical_details":str(p)})
            result["analysis_error"]="File unavailable"; return result,evidence
        try:
            h=hashlib.sha256()
            with p.open('rb') as f:
                for c in iter(lambda:f.read(1024*1024),b''): h.update(c)
            result['file_sha256']=h.hexdigest()
            sr=str(metadata.get('Sample Rate','Not available')); channels=str(metadata.get('Channels','Not available')); encoder=str(metadata.get('Encoder','Not available'))
            text=' '.join([encoder,str(metadata.get('Title','')),str(metadata.get('Comment',''))]).lower()
            marker=next((x for x in SYNTH_TERMS if x in text),None)
            if marker:
                evidence.append({"id":"AUD_EVID_SYNTH_TAG","title":"Possible synthetic-audio metadata marker","category":"AI Generation","severity":"Medium","description":f"Metadata contains a string associated with speech synthesis ({marker}). Tags can be forged or copied and do not prove this audio was generated.","technical_details":f"Encoder field: {encoder[:300]}"})
            else:
                evidence.append({"id":"AUD_EVID_NO_SYNTH_TAG","title":"No explicit synthesis marker found","category":"Metadata","severity":"Informational","description":"No known synthetic-speech marker was found in the metadata inspected. Absence of a marker does not establish that audio is genuine.","technical_details":f"Sample rate={sr}; channels={channels}; encoder={encoder}; no trained classifier used."})
            evidence.append({"id":"AUD_EVID_TECH_METADATA","title":"Technical audio metadata recorded","category":"Acoustics","severity":"Informational","description":"Sample rate, channel count and encoder are descriptive technical properties, not reliable indicators of AI generation.","technical_details":f"Sample rate={sr}; channels={channels}; encoder={encoder}"})
            result.update({"ai_marker_found":bool(marker),"feature_summary":{"metadata_marker":bool(marker),"sample_rate":sr,"channels":channels,"trained_detector_used":False}})
        except Exception as exc:
            logger.exception('Audio analysis failed')
            result['analysis_error']=f'{type(exc).__name__}: {exc}'
            evidence.append({"id":"AUD_EVID_ERROR","title":"Audio inspection failed","category":"System","severity":"Informational","description":"The file could not be inspected reliably; no AI verdict is available.","technical_details":result['analysis_error']})
        return result,evidence
