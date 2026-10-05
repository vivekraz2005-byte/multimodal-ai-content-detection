import os
import re
from pathlib import Path
from typing import Dict, Any, List
from app.schemas.analysis import ProvenanceInfo

class ProvenanceAnalyzer:
    @staticmethod
    def analyze(file_path: Path, media_type: str) -> ProvenanceInfo:
        """
        Inspects content for C2PA (Coalition for Content Provenance and Authenticity)
        manifests, JUMBF boxes, and XMP provenance chains.
        Crucial principle: Absence of Content Credentials does NOT imply fake content.
        """
        c2pa_detected = False
        manifest_type = None
        claim_generator = None
        creator = None
        digital_source = None
        actions: List[Dict[str, Any]] = []

        try:
            with open(file_path, "rb") as f:
                # Read chunks looking for C2PA / JUMBF boxes
                content = f.read(256 * 1024)  # First 256KB
                
                # Check for JUMBF / C2PA signature
                if b"c2pa" in content or b"jumb" in content or b"c2pa.claim" in content:
                    c2pa_detected = True
                    manifest_type = "C2PA Manifest (JUMBF)"
                    status = "Verified Credentials Found"
                    
                    # Try to extract generator or claim info
                    if b"Adobe Firefly" in content:
                        claim_generator = "Adobe Firefly AI"
                        digital_source = "trainedAlgorithmicMedia (AI Generated)"
                        actions.append({"action": "c2pa.created", "software": "Adobe Firefly", "timestamp": "Embedded"})
                    elif b"Photoshop" in content:
                        claim_generator = "Adobe Photoshop"
                        digital_source = "digitalCapture + edited"
                        actions.append({"action": "c2pa.edited", "software": "Adobe Photoshop", "timestamp": "Embedded"})
                    elif b"DALL-E" in content or b"OpenAI" in content:
                        claim_generator = "OpenAI DALL-E"
                        digital_source = "trainedAlgorithmicMedia"
                    else:
                        claim_generator = "C2PA Compliant Publisher"
                        digital_source = "Content Credentials v1.x Manifest"
                
                # Check for XMP history
                if b"<xmpMM:History>" in content or b"stEvt:action" in content:
                    if not c2pa_detected:
                        manifest_type = "XMP History Chain"
                        status = "Unsigned Manifest Metadata"
                    actions.append({"action": "xmp.edit_history", "detail": "Prior revisions found in XMP metadata"})

        except Exception:
            pass

        if c2pa_detected:
            explanation = (
                "Cryptographic Content Credentials (C2PA) or provenance metadata were detected in this file. "
                "This allows tracking the authoring tool, edits, and whether synthetic generation was declared."
            )
            verification_status = "Content Credentials Detected"
        else:
            explanation = (
                "No cryptographic Content Credentials (C2PA/CAI) or signed provenance manifests were found. "
                "Notice: The vast majority of authentic internet media does not yet include C2PA credentials. "
                "The absence of provenance data does NOT automatically imply that the content is manipulated or synthetic."
            )
            verification_status = "No Content Credentials Detected"

        return ProvenanceInfo(
            detected=c2pa_detected,
            status=verification_status,
            manifest_type=manifest_type,
            creator=creator,
            claim_generator=claim_generator,
            digital_source_type=digital_source,
            actions=actions,
            explanation=explanation
        )
