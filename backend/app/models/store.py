import json
from typing import Dict, Any, List, Optional
from pathlib import Path
from app.config import BASE_DIR

# Persistent in-memory + optional JSON caching store
class Store:
    def __init__(self):
        self.uploads: Dict[str, Dict[str, Any]] = {}
        self.analyses: Dict[str, Dict[str, Any]] = {}
        self.history: List[Dict[str, Any]] = []

    def save_upload(self, file_id: str, data: Dict[str, Any]):
        self.uploads[file_id] = data

    def get_upload(self, file_id: str) -> Optional[Dict[str, Any]]:
        return self.uploads.get(file_id)

    def save_analysis(self, analysis_id: str, data: Dict[str, Any]):
        self.analyses[analysis_id] = data
        # Also prepend to history list
        hist_entry = {
            "analysis_id": analysis_id,
            "file_id": data.get("file_id"),
            "filename": data.get("filename"),
            "media_type": data.get("media_type"),
            "assessment": data.get("assessment"),
            "confidence": data.get("confidence"),
            "analyzed_at": data.get("analyzed_at"),
            "file_size_formatted": data.get("metadata", {}).get("File Size", "Unknown")
        }
        # Avoid duplicate history entries
        self.history = [h for h in self.history if h["analysis_id"] != analysis_id]
        self.history.insert(0, hist_entry)

    def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        return self.analyses.get(analysis_id)

    def list_history(self) -> List[Dict[str, Any]]:
        return self.history

store = Store()
