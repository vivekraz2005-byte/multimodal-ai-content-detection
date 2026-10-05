from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class EvidenceItem(BaseModel):
    id: str
    title: str
    category: str  # e.g., "AI Generation", "Manipulation", "Metadata", "Provenance", "Acoustics"
    severity: str  # "High", "Medium", "Low", "Informational"
    description: str
    technical_details: Optional[str] = None

class SignalBreakdown(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    confidence: str  # "High", "Medium", "Low"
    indicators_detected: int = 0
    summary: str

class ProvenanceInfo(BaseModel):
    detected: bool
    status: str  # "Verified Credentials", "Unsigned Manifest Found", "No Content Credentials Detected"
    manifest_type: Optional[str] = None
    creator: Optional[str] = None
    claim_generator: Optional[str] = None
    digital_source_type: Optional[str] = None
    actions: List[Dict[str, Any]] = []
    explanation: str

class AnalysisRequest(BaseModel):
    file_id: str

class UploadResponse(BaseModel):
    file_id: str
    filename: str
    original_filename: str
    media_type: str  # "image", "video", "audio", "document"
    file_size_bytes: int
    file_size_formatted: str
    mime_type: str
    preview_url: Optional[str] = None
    upload_timestamp: str

class AnalysisResponse(BaseModel):
    analysis_id: str
    file_id: str
    filename: str
    media_type: str
    assessment: str  # "Likely Authentic", "Likely AI-Generated", "Potentially Manipulated", "Suspicious", "Inconclusive"
    confidence: str  # "High", "Medium", "Low"
    confidence_score: float  # 0.0 to 1.0
    evidence_strength: str  # "Strong", "Medium", "Weak"
    uncertainty: str  # "Low", "Moderate", "High"
    uncertainty_reasons: List[str] = []
    why_explanation: str
    signals: Dict[str, SignalBreakdown]
    evidence_list: List[EvidenceItem]
    metadata: Dict[str, Any]
    provenance: ProvenanceInfo
    recommendations: List[str]
    disclaimer: str
    analyzed_at: str
    engine_mode: str = "Evidence-Based Heuristic & Signal Extraction Engine (Pluggable ML Ready)"

class HistoryItem(BaseModel):
    analysis_id: str
    file_id: str
    filename: str
    media_type: str
    assessment: str
    confidence: str
    analyzed_at: str
    file_size_formatted: str
