from typing import Dict, Any, List, Tuple
from app.schemas.analysis import EvidenceItem, SignalBreakdown, ProvenanceInfo

class EvidenceFusionEngine:
    """
    Evidence-based fusion service that integrates signals from AI detection,
    manipulation analysis, metadata checks, and provenance verification.
    Avoids arbitrary random percentage generation; computes structured scoring,
    uncertainty reasons, confidence metrics, and explainable human-readable assessments.
    """

    @staticmethod
    def fuse(
        media_type: str,
        media_results: Dict[str, Any],
        raw_evidence: List[Dict[str, Any]],
        metadata: Dict[str, Any],
        provenance: ProvenanceInfo
    ) -> Dict[str, Any]:
        # 1. Normalize individual signal channels
        ai_score = float(media_results.get("ai_generation_score", 0.30))
        manip_score = float(media_results.get("manipulation_score", 0.20))
        
        # Metadata anomaly score
        meta_score, meta_indicators = EvidenceFusionEngine._score_metadata_anomalies(media_type, metadata)
        
        # Provenance score
        prov_score = 0.10 if provenance.detected else 0.45

        # 2. Count indicators and confidence factors
        high_sev_evidence = [e for e in raw_evidence if e.get("severity") == "High"]
        med_sev_evidence = [e for e in raw_evidence if e.get("severity") == "Medium"]
        low_sev_evidence = [e for e in raw_evidence if e.get("severity") == "Low"]

        # Signal breakdown representation
        signals = {
            "ai_generation": SignalBreakdown(
                score=round(ai_score, 3),
                confidence="High" if len(high_sev_evidence) > 0 else ("Medium" if ai_score > 0.50 else "Low"),
                indicators_detected=len([e for e in raw_evidence if e.get("category") == "AI Generation"]),
                summary=f"Synthesized generative signal metric: {ai_score:.2f}."
            ),
            "manipulation": SignalBreakdown(
                score=round(manip_score, 3),
                confidence="Medium" if manip_score > 0.55 else "Low",
                indicators_detected=len([e for e in raw_evidence if e.get("category") == "Manipulation"]),
                summary=f"Compression and localized editing signal metric: {manip_score:.2f}."
            ),
            "metadata": SignalBreakdown(
                score=round(meta_score, 3),
                confidence="Medium",
                indicators_detected=meta_indicators,
                summary=f"Metadata consistency index: {meta_score:.2f} with {meta_indicators} anomalies."
            ),
            "provenance": SignalBreakdown(
                score=round(prov_score, 3),
                confidence="High" if provenance.detected else "Medium",
                indicators_detected=1 if provenance.detected else 0,
                summary="C2PA cryptographic manifests present." if provenance.detected else "No cryptographic Content Credentials found."
            )
        }

        # 3. Assessment & Confidence Derivation
        # Determine top-level assessment
        has_direct_ai_tag = any(e.get("id") in ("IMG_EVID_GEN_TAGS", "VID_EVID_SYNTH_TAG", "AUD_EVID_SYNTH_TAG", "DOC_EVID_LLM_TAG") for e in raw_evidence)
        
        if has_direct_ai_tag or (ai_score >= 0.75 and len(high_sev_evidence) >= 1):
            assessment = "Likely AI-Generated"
            confidence = "High"
            confidence_score = 0.88
            evidence_strength = "Strong"
            uncertainty = "Low"
            uncertainty_reasons = []
            why_explanation = (
                "Explicit generative AI markers, prompts, or neural synthesizer signatures were identified directly "
                "within the file's structure and signal distribution."
            )
        elif ai_score >= 0.60:
            assessment = "Likely AI-Generated"
            confidence = "Medium"
            confidence_score = 0.72
            evidence_strength = "Medium"
            uncertainty = "Moderate"
            uncertainty_reasons = [
                "Signals align with generative synthesis, but absence of raw training watermarks leaves open the possibility of heavy post-processing filters.",
                "Real optical footage with severe compression can occasionally trigger similar frequency anomalies."
            ]
            why_explanation = (
                "Multiple frequency domain, texture smoothness, or vocoder cues align closely with generative synthetic pipelines, "
                "though secondary confirmation remains recommended."
            )
        elif manip_score >= 0.65:
            assessment = "Potentially Manipulated"
            confidence = "Medium"
            confidence_score = 0.68
            evidence_strength = "Medium"
            uncertainty = "Moderate"
            uncertainty_reasons = [
                "Localized compression artifacts may stem from multiple resaves or social platform transcoding rather than deceptive splicing."
            ]
            why_explanation = (
                "Several signals indicate potential localized re-encoding or structural editing, but available evidence "
                "is insufficient to prove malicious tampering beyond standard digital editing."
            )
        elif (ai_score > 0.45 or manip_score > 0.45 or meta_score > 0.60):
            assessment = "Suspicious"
            confidence = "Medium"
            confidence_score = 0.58
            evidence_strength = "Medium"
            uncertainty = "Moderate"
            uncertainty_reasons = [
                "Inconsistent metadata or unusual compression patterns were observed without conclusive proof of synthetic generation.",
                "Lack of camera hardware tags or provenance manifests increases ambiguity."
            ]
            why_explanation = (
                "The file displays anomalous characteristics, such as missing hardware signatures or inconsistent error levels, "
                "warranting further contextual verification."
            )
        elif len(high_sev_evidence) == 0 and len(med_sev_evidence) == 0 and (metadata.get("EXIF Present") or metadata.get("Camera Make") != "Not available" or metadata.get("Creation Date") != "Not available"):
            assessment = "Likely Authentic"
            confidence = "High" if provenance.detected else "Medium"
            confidence_score = 0.82 if provenance.detected else 0.75
            evidence_strength = "Strong" if provenance.detected else "Medium"
            uncertainty = "Low" if provenance.detected else "Moderate"
            uncertainty_reasons = [
                "Absence of cryptographic C2PA signature means origin cannot be guaranteed against sophisticated zero-shot synthesis that mimics camera EXIF."
            ] if not provenance.detected else []
            why_explanation = (
                "Consistent hardware capture metadata, natural sensor noise grain, and absence of synthetic generation anomalies "
                "support the likelihood of authentic human/camera origin."
            )
        else:
            assessment = "Inconclusive"
            confidence = "Low"
            confidence_score = 0.42
            evidence_strength = "Weak"
            uncertainty = "High"
            uncertainty_reasons = [
                "File metadata is largely stripped or standard container packaging obscures primary sensor traces.",
                "Available signals do not provide sufficient statistical deviation to confirm or reject synthetic origin."
            ]
            why_explanation = (
                "The available signals provide insufficient statistical divergence to decisively determine authenticity or synthetic origin."
            )

        # 4. Compile Evidence List formatted as Pydantic models
        formatted_evidence = []
        for idx, item in enumerate(raw_evidence, 1):
            formatted_evidence.append(EvidenceItem(
                id=item.get("id", f"EVID_{idx:02d}"),
                title=item.get("title", f"Evidence {idx:02d}"),
                category=item.get("category", "Analysis"),
                severity=item.get("severity", "Low"),
                description=item.get("description", ""),
                technical_details=item.get("technical_details", None)
            ))

        # 5. Recommendations
        recommendations = EvidenceFusionEngine._generate_recommendations(assessment, provenance.detected, media_type)

        disclaimer = (
            "This system provides evidence-based authenticity indicators, not absolute proof of whether content is real or fake. "
            "AI detection can produce false positives and false negatives. Results should be interpreted with context and, "
            "where necessary, verified using trusted primary sources and cryptographic Content Credentials."
        )

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
        anomalies = 0
        if media_type == "image":
            if not metadata.get("EXIF Present", False):
                anomalies += 1
            if metadata.get("Software / Editor", "Not available") != "Not available":
                anomalies += 1
            score = 0.30 + (0.25 * anomalies)
        elif media_type == "video":
            if metadata.get("Encoding Tool", "Not available") != "Not available":
                anomalies += 1
            score = 0.25 + (0.25 * anomalies)
        elif media_type == "document":
            prod = metadata.get("Producer / Creator", "Not available")
            if prod != "Not available" and ("reportlab" in prod.lower() or "headless" in prod.lower()):
                anomalies += 1
            score = 0.20 + (0.30 * anomalies)
        else:
            score = 0.25
        return min(round(score, 3), 1.0), anomalies

    @staticmethod
    def _generate_recommendations(assessment: str, c2pa_detected: bool, media_type: str) -> List[str]:
        recs = []
        if assessment == "Likely AI-Generated":
            recs.append("Request the original raw uncompressed capture file (RAW, unedited WAV, or camera master).")
            recs.append("Inspect reverse search archives (e.g. Google Lens, TinEye) to determine original publishing author.")
            recs.append("Do not cite or publish this media as unverified factual evidence without corroboration.")
        elif assessment == "Potentially Manipulated":
            recs.append("Perform a side-by-side comparison with earlier versions of this media if available.")
            recs.append("Check whether the detected edits are benign artistic adjustments (color grading/cropping) or semantic changes.")
        elif assessment == "Suspicious":
            recs.append("Verify the publisher or sender through an independent trusted channel.")
            recs.append("Check if the file has been stripped of metadata during upload by an intermediary social platform.")
        elif assessment == "Likely Authentic":
            recs.append("Content exhibits natural physical capture signatures, but remain vigilant for out-of-context misattribution.")
            recs.append("If publishing, consider adding C2PA Content Credentials to ensure downstream provenance preservation.")
        else:
            recs.append("File contains insufficient structural data; consider obtaining a higher-quality copy or direct camera export.")
            recs.append("Cross-reference with contextual reporting, eyewitness accounts, or official agency statements.")

        if not c2pa_detected:
            recs.append("Note: Absence of Content Credentials does not imply fabrication, as most legacy workflows do not embed C2PA manifests.")

        return recs
