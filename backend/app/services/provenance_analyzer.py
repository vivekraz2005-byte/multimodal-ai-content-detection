"""C2PA provenance inspection. A byte-string marker is never treated as verified."""
from pathlib import Path
from typing import Any, Dict, List
import logging
from app.schemas.analysis import ProvenanceInfo
logger=logging.getLogger(__name__)
class ProvenanceAnalyzer:
    @staticmethod
    def analyze(file_path: Path, media_type: str) -> ProvenanceInfo:
        p=Path(file_path); detected=False; verified=False; manifest_type=None; creator=None; generator=None; digital_source=None; actions: List[Dict[str,Any]]=[]
        explanation='No successful cryptographic provenance verification was performed. Missing credentials do not mean the file is fake.'
        status='No Content Credentials Detected'
        try:
            # Optional official C2PA SDK. Reader validation result is surfaced, never inferred from string matches.
            from c2pa import Reader  # type: ignore
            with Reader(str(p)) as reader:
                report=reader.json()
                import json
                data=json.loads(report) if isinstance(report,str) else report
                if isinstance(data,dict):
                    manifests=data.get('manifests') or {}
                    detected=bool(manifests) or bool(data.get('active_manifest'))
                    active_id=data.get('active_manifest')
                    active=manifests.get(active_id,{}) if active_id and isinstance(manifests,dict) else {}
                    if isinstance(active,dict):
                        manifest_type='C2PA manifest store'
                        generator=active.get('claim_generator')
                        creator=active.get('claim_generator_info')
                        assertions=active.get('assertions') or []
                        for a in assertions:
                            if isinstance(a,dict):
                                label=str(a.get('label',''))
                                val=a.get('data')
                                actions.append({'action':label,'detail':str(val)[:500]})
                                if 'digital-source-type' in label.lower() and isinstance(val,dict): digital_source=str(val.get('digitalSourceType','')) or None
                    validation=reader.get_validation_state() if hasattr(reader,'get_validation_state') else None
                    # State APIs vary by SDK version. Only explicit successful/valid state is treated as verified.
                    state=str(validation).lower() if validation is not None else ''
                    verified=detected and ('valid' in state or 'success' in state) and not any(x in state for x in ('invalid','error','fail'))
                    status='Content Credentials Verified' if verified else ('Content Credentials Detected - Verification Unconfirmed' if detected else 'No Content Credentials Detected')
                    explanation=('C2PA SDK reported a manifest and a successful validation state. Review the validation report and trust chain before relying on it.' if verified else ('C2PA manifest data was returned, but this adapter could not confirm successful cryptographic/trust validation.' if detected else explanation))
        except ImportError:
            status='Verification Unavailable (c2pa-python not installed)'
            explanation='The official C2PA Python SDK is not installed. No cryptographic verification was attempted. This is not evidence that the file is fake.'
        except Exception as exc:
            logger.info('C2PA verification unavailable for %s: %s',p.name,exc)
            status='Verification Error / Unavailable'
            explanation=f'C2PA verification could not be completed ({type(exc).__name__}). No authenticity conclusion is inferred.'
        return ProvenanceInfo(detected=detected, verified=verified, status=status, manifest_type=manifest_type, creator=str(creator) if creator is not None else None, claim_generator=str(generator) if generator is not None else None, digital_source_type=digital_source, actions=actions, explanation=explanation)
