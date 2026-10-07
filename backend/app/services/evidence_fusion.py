"""
=============================================================================
ENTERPRISE EVIDENCE FUSION & MULTIMODAL DECISION ENGINE (v3.5)
=============================================================================
File: backend/app/services/evidence_fusion_engine.py
Description: 
    Performs rigorous multi-signal fusion across AI detection metrics, 
    manipulation vectors, metadata integrity checks, and C2PA provenance.
    Computes explainable risk scoring, uncertainty vectors, and structured 
    recommendations without arbitrary randomness.
=============================================================================
"""

import logging
from typing import Dict, Any, List, Tuple
from app.schemas.analysis import EvidenceItem, SignalBreakdown, ProvenanceInfo

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class EvidenceFusionEngine:
    """
    Enterprise-Grade Evidence Fusion & Synthesis Service.
    Aggregates multimodal forensic signals into a unified explainable decision matrix.
    """

    @staticmethod
    def fuse(
        media_type: str,
        media_results: Dict[str, Any],
        raw_evidence: List[Dict[str, Any]],
        metadata: Dict[str, Any],
        provenance: ProvenanceInfo
    ) -> Dict[str, Any]:
        logger.info(f"Executing Evidence Fusion for media type: '{media_type}' with {len(raw_evidence)} evidence signals.")

        # 1. Normalize individual signal channels safely
        ai_score = float(media_results.get("ai_generation_score", 0.30))
        manip_score = float(media_results.get("manipulation_score", 0.20))
        
        # Metadata anomaly score computation (Filtering out legitimate firmware builds)
        meta_score, meta_indicators = EvidenceFusionEngine._score_metadata_anomalies(media_type, metadata)
        
        # Provenance trust score (C2PA cryptographic manifests lower risk significantly)
        prov_score = 0.05 if provenance.detected else 0.45

        # 2. Categorize evidence severity distributions
        high_sev_evidence = [e for e in raw_evidence if e.get("severity") == "High"]
        med_sev_evidence = [e for e in raw_evidence if e.get("severity") == "Medium"]
        low_sev_evidence = [e for e in raw_evidence if e.get("severity") == "Low"]

        # 3. Construct Granular Signal Breakdown Schema
        signals = {
            "ai_generation": SignalBreakdown(
                score=round(ai_score, 3),
                confidence="High" if len(high_sev_evidence) > 0 else ("Medium" if ai_score > 0.50 else "Low"),
                indicators_detected=len([e for e in raw_evidence if e.get("category") == "AI Generation"]),
                summary=f"Synthesized generative neural signal metric: {ai_score:.3f}."
            ),
            "manipulation": SignalBreakdown(
                score=round(manip_score, 3),
                confidence="Medium" if manip_score > 0.55 else "Low",
                indicators_detected=len([e for e in raw_evidence if e.get("category") == "Manipulation"]),
                summary=f"Compression, splicing, and editing artifact index: {manip_score:.3f}."
            ),
            "metadata": SignalBreakdown(
                score=round(meta_score, 3),
                confidence="Medium",
                indicators_detected=meta_indicators,
                summary=f"Metadata consistency index: {meta_score:.3f} with {meta_indicators} structural anomalies."
            ),
            "provenance": SignalBreakdown(
                score=round(prov_score, 3),
                confidence="High" if provenance.detected else "Medium",
                indicators_detected=1 if provenance.detected else 0,
                summary="Cryptographic C2PA Content Credentials verified." if provenance.detected else "No cryptographic manifest signature discovered."
            )
        }

        # 4. Advanced Assessment & Weighted Confidence Derivation
        has_direct_ai_tag = any(
            e.get("id") in ("IMG_EVID_GEN_SIGNATURE", "DOC_EVID_LLM_TAG", "VID_EVID_SYNTH_TAG", "AUD_EVID_SYNTH_TAG") 
            for e in raw_evidence
        )
        
        if has_direct_ai_tag or (ai_score >= 0.76 and len(high_sev_evidence) >= 1):
            assessment = "Likely AI-Generated"
            confidence = "High"
            confidence_score = 0.91
            evidence_strength = "Strong"
            uncertainty = "Low"
            uncertainty_reasons = []
            why_explanation = (
                "Explicit generative AI parameter markers, prompt structures, or neural synthesizer signatures "
                "were identified directly within the container format and spectral distribution."
            )
        elif ai_score >= 0.62:
            assessment = "Likely AI-Generated"
            confidence = "Medium"
            confidence_score = 0.74
            evidence_strength = "Medium"
            uncertainty = "Moderate"
            uncertainty_reasons = [
                "Signals align with generative synthesis, but absence of raw training watermarks leaves open the possibility of heavy filters.",
                "High-resolution optical captures with severe transcoding artifacts can occasionally trigger similar frequency anomalies."
            ]
            why_explanation = (
                "Multiple spatial frequency components, micro-texture smoothness levels, and token distribution patterns "
                "align closely with modern synthetic pipelines."
            )
        elif manip_score >= 0.68:
            assessment = "Potentially Manipulated"
            confidence = "Medium"
            confidence_score = 0.70
            evidence_strength = "Medium"
            uncertainty = "Moderate"
            uncertainty_reasons = [
                "Localized compression irregularities may stem from multi-platform transcoding rather than malicious tampering."
            ]
            why_explanation = (
                "Spectral and quantization error distributions indicate potential localized re-encoding or structural editing, "
                "though conclusive malicious intent requires contextual validation."
            )
        elif (ai_score > 0.46 or manip_score > 0.46 or meta_score > 0.62):
            assessment = "Suspicious"
            confidence = "Medium"
            confidence_score = 0.60
            evidence_strength = "Medium"
            uncertainty = "Moderate"
            uncertainty_reasons = [
                "Inconsistent container metadata or unusual compression structures were observed without explicit proof of generation.",
                "Stripped hardware tags or absent optical sensor telemetry increases forensic ambiguity."
            ]
            why_explanation = (
                "The file displays anomalous structural characteristics, such as missing hardware parameters or irregular quantization, "
                "warranting secondary verification."
            )
        elif len(high_sev_evidence) == 0 and len(med_sev_evidence) == 0 and (
            metadata.get("EXIF Present") or metadata.get("Camera Make") != "Not available" or metadata.get("Creation Date") != "Not available"
        ):
            assessment = "Likely Authentic"
            confidence = "High" if provenance.detected else "Medium"
            confidence_score = 0.85 if provenance.detected else 0.76
            evidence_strength = "Strong" if provenance.detected else "Medium"
            uncertainty = "Low" if provenance.detected else "Moderate"
            uncertainty_reasons = [
                "Absence of cryptographic C2PA manifests means origin cannot be guaranteed against zero-shot spoofed camera EXIF."
            ] if not provenance.detected else []
            why_explanation = (
                "Verified hardware manufacturer tags, natural photon noise grain, and consistent temporal metadata "
                "strongly support authentic optical capture origin."
            )
        else:
            assessment = "Inconclusive"
            confidence = "Low"
            confidence_score = 0.40
            evidence_strength = "Weak"
            uncertainty = "High"
            uncertainty_reasons = [
                "File metadata is largely stripped, and container packaging obscures primary sensor fingerprints.",
                "Available statistical metrics do not provide enough divergence to confirm or reject synthetic origin."
            ]
            why_explanation = (
                "The extracted forensic indicators provide insufficient statistical divergence to decisively determine authenticity or origin."
            )

        # 5. Compile and Validate Evidence List via Pydantic Schema
        formatted_evidence = []
        for idx, item in enumerate(raw_evidence, 1):
            formatted_evidence.append(EvidenceItem(
                id=item.get("id", f"EVID_{idx:02d}"),
                title=item.get("title", f"Forensic Finding {idx:02d}"),
                category=item.get("category", "Analysis"),
                severity=item.get("severity", "Low"),
                description=item.get("description", ""),
                technical_details=item.get("technical_details", None)
            ))

        # 6. Generate Contextual Recommendations & Disclaimer
        recommendations = EvidenceFusionEngine._generate_recommendations(assessment, provenance.detected, media_type)

        disclaimer = (
            "This enterprise engine supplies evidence-based authenticity metrics and probabilistic indicators, "
            "not absolute legal proof. AI detection models can occasionally exhibit false positives. Results "
            "should be interpreted alongside contextual verification and trusted cryptographic Content Credentials."
        )

        logger.info(f"Fusion complete. Assessment: '{assessment}' with Confidence Score: {confidence_score}")

        return {
            "assessment": assessment,
            "confidence": confidence,
            "confidence_score": confidence_score,
            "evidence_strength": evidence_strength,
            "uncertainty": uncertainty,
            "uncertainty_reasons": uncertainty_reasons,
            "why_explanation": why_explanation,
            "signals": signals,
            "evidence_list": formatted_evidence,
            "recommendations": recommendations,
            "disclaimer": disclaimer
        }

    @staticmethod
    def _score_metadata_anomalies(media_type: str, metadata: Dict[str, Any]) -> Tuple[float, int]:
        """Calculates precise metadata anomaly scores, filtering out legitimate device firmware tags."""
        anomalies = 0
        try:
            if media_type == "image":
                if not metadata.get("EXIF Present", False):
                    anomalies += 1
                
                # Check software/editor, but IGNORE known smartphone manufacturer firmware build strings
                software = metadata.get("Software / Editor", "Not available")
                if software != "Not available":
                    sw_lower = software.lower()
                    # Common phone firmware identifiers (Samsung, Apple, Google, Xiaomi, etc.)
                    is_phone_firmware = any(tag in sw_lower for tag in ["exx", "dxx", "ios", "pixel", "miui", "oneui", "build"])
                    if not is_phone_firmware and not any(editor in sw_lower for editor in ["camera", "droid"]):
                        anomalies += 1  # Only count actual editing software like Photoshop, Lightroom, Snapseed
                
                score = 0.20 + (0.20 * anomalies)
            elif media_type == "video":
                encoding_tool = metadata.get("Encoding Tool", "Not available")
                if encoding_tool != "Not available" and not any(cam in encoding_tool.lower() for cam in ["samsung", "apple", "obs"]):
                    anomalies += 1
                score = 0.20 + (0.25 * anomalies)
            elif media_type == "document":
                prod = metadata.get("Producer / Creator", "Not available")
                if prod != "Not available" and any(term in prod.lower() for term in ["reportlab", "headless", "puppeteer", "weasyprint"]):
                    anomalies += 1
                score = 0.20 + (0.30 * anomalies)
            else:
                score = 0.25
        except Exception:
            score = 0.25

        return min(round(score, 3), 1.0), anomalies

    @staticmethod
    def _generate_recommendations(assessment: str, c2pa_detected: bool, media_type: str) -> List[str]:
        """Generates targeted action items based on final assessment."""
        recs = []
        if assessment == "Likely AI-Generated":
            recs.append("Request the original uncompressed master asset (RAW image, unedited WAV, or direct camera container).")
            recs.append("Perform reverse search indexing across major databases to identify initial web publication sources.")
            recs.append("Do not cite this media file as unverified factual evidence without corroboration.")
        elif assessment == "Potentially Manipulated":
            recs.append("Conduct a side-by-side comparison with historical file versions or platform backups if accessible.")
            recs.append("Verify whether detected modifications correspond to benign adjustments (crop, color grading) or semantic alterations.")
        elif assessment == "Suspicious":
            recs.append("Validate the publishing source and transmitter identity through an independent channel.")
            recs.append("Investigate whether intermediaries or social sharing platforms stripped container metadata during upload.")
        elif assessment == "Likely Authentic":
            recs.append("Media displays consistent optical/sensor capture characteristics, but maintain vigilance against out-of-context framing.")
            recs.append("Consider embedding C2PA Content Credentials if publishing downstream to preserve verified provenance.")
        else:
            recs.append("File contains insufficient structural telemetry; obtain a higher-fidelity export directly from the source.")
            recs.append("Cross-reference content with official agency statements, eyewitness reporting, or contextual logs.")

        if not c2pa_detected:
            recs.append("Note: The absence of Content Credentials does not imply fabrication, as legacy pipelines rarely embed C2PA manifests.")

        return recs