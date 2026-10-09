"""Conservative evidence fusion; never treats heuristic features as calibrated probabilities."""
from typing import Any, Dict, List, Tuple
import math, logging
from app.schemas.analysis import EvidenceItem, SignalBreakdown
logger=logging.getLogger(__name__)
class EvidenceFusionEngine:
    AI_MARKER_IDS={"IMG_EVID_GEN_SIGNATURE","DOC_EVID_LLM_TAG","VID_EVID_SYNTH_TAG","AUD_EVID_SYNTH_TAG"}
    @staticmethod
    def _score(value: Any, default: float=0.0)->float:
        try: v=float(value)
        except (TypeError,ValueError,OverflowError): return default
        return max(0.0,min(1.0,v)) if math.isfinite(v) else default
    @staticmethod
    def _verified(provenance: Any)->bool:
        # Current ProvenanceInfo has no `verified` field, so do not infer it from `detected` or status strings.
        return getattr(provenance,'verified',False) is True or (isinstance(provenance,dict) and provenance.get('verified') is True)
    @staticmethod
    def fuse(media_type: str, media_results: Dict[str,Any], raw_evidence: List[Dict[str,Any]], metadata: Dict[str,Any], provenance: Any)->Dict[str,Any]:
        media_results=media_results if isinstance(media_results,dict) else {}; raw_evidence=raw_evidence if isinstance(raw_evidence,list) else []; metadata=metadata if isinstance(metadata,dict) else {}
        ai_model=media_results.get('ai_model_available') is True
        manipulation_model=media_results.get('manipulation_model_available') is True
        ai_score=EvidenceFusionEngine._score(media_results.get('ai_generation_score'))
        manip_score=EvidenceFusionEngine._score(media_results.get('manipulation_score'))
        marker_findings=[x for x in raw_evidence if isinstance(x,dict) and x.get('id') in EvidenceFusionEngine.AI_MARKER_IDS]
        high_manip=[x for x in raw_evidence if isinstance(x,dict) and str(x.get('category','')).lower()=='manipulation' and str(x.get('severity','')).lower()=='high']
        verified=EvidenceFusionEngine._verified(provenance)
        metadata_count=sum(1 for k in ('EXIF Present','Software / Editor','Encoding Tool','Producer / Creator') if metadata.get(k) not in (None,False,'','Not available','Unknown','N/A'))
        metadata_score=min(metadata_count/4,1.0)
        formatted=[]
        for i,item in enumerate(raw_evidence,1):
            if not isinstance(item,dict): continue
            formatted.append(EvidenceItem(id=str(item.get('id',f'EVID_{i:02d}')),title=str(item.get('title',f'Finding {i}')),category=str(item.get('category','Analysis')),severity=str(item.get('severity','Informational')),description=str(item.get('description','')),technical_details=str(item['technical_details']) if item.get('technical_details') is not None else None))
        # Scores in the API are display-compatible placeholders when no model exists. Summary explicitly says unavailable.
        signals={
          'ai_generation':SignalBreakdown(score=round(ai_score,3),confidence='Low' if not ai_model else 'Medium',indicators_detected=len(marker_findings),summary=('Validated model output; calibration must be confirmed on a representative test set.' if ai_model else 'No trained AI detector ran. The displayed score is not an estimate of AI likelihood; metadata markers are weak supporting evidence only.')),
          'manipulation':SignalBreakdown(score=round(manip_score,3),confidence='Low' if not manipulation_model else 'Medium',indicators_detected=len(high_manip),summary=('Model output; validation required.' if manipulation_model else 'No validated manipulation model ran. Metadata and encoding artifacts are not proof of editing.')),
          'metadata':SignalBreakdown(score=round(metadata_score,3),confidence='Low',indicators_detected=metadata_count,summary=f'{metadata_count} descriptive metadata fields were present. This is not an AI-detection score.'),
          'provenance':SignalBreakdown(score=1.0 if verified else 0.0,confidence='High' if verified else 'Low',indicators_detected=int(verified),summary=str(getattr(provenance,'explanation','Provenance not verified.')))
        }
        if ai_model and ai_score>=0.8:
            assessment='Likely AI-Generated'; confidence='Medium'; confidence_score=ai_score; strength='Medium'; uncertainty='Moderate'; why='A configured trained model returned a high AI-generation score. This is a model prediction, not proof; performance depends on model validation and the file domain.'
        elif manipulation_model and manip_score>=0.8 and high_manip:
            assessment='Potentially Manipulated'; confidence='Medium'; confidence_score=manip_score; strength='Medium'; uncertainty='Moderate'; why='A configured manipulation model and high-severity evidence suggest further review is warranted.'
        elif marker_findings:
            assessment='Suspicious'; confidence='Low'; confidence_score=0.2; strength='Weak'; uncertainty='High'; why='A generator-related metadata marker was found. Such markers can be absent, copied or forged and do not prove AI generation.'
        else:
            assessment='Inconclusive'; confidence='Low'; confidence_score=0.2; strength='Weak'; uncertainty='High'; why='No validated model prediction or decisive independent evidence was available. Inconclusive does not mean authentic or fake.'
        recommendations=['Treat this as a screening result, not proof or an accusation.','Preserve the original file and record where it came from.','Use a validated model and evaluate it on representative real, generated and edited files before relying on model scores.','For scams, independently verify the sender, identity, URL and transaction; media classification alone cannot determine whether a scam occurred.']
        return {'assessment':assessment,'confidence':confidence,'confidence_score':round(EvidenceFusionEngine._score(confidence_score),3),'evidence_strength':strength,'uncertainty':uncertainty,'uncertainty_reasons':['No validated calibrated model was run.' if not (ai_model or manipulation_model) else 'Model predictions can fail outside their evaluation domain.','Metadata can be missing, edited or copied.','Provenance and AI detection are different questions.'],'why_explanation':why,'signals':signals,'evidence_list':formatted,'recommendations':recommendations,'disclaimer':'AuthenticityAI is a screening aid. No detector can guarantee exact identification. Scores are not calibrated probabilities unless a specific model has been validated and calibrated on representative data.'}
