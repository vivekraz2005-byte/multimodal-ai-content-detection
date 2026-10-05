from fastapi import APIRouter
from typing import List
from app.schemas.analysis import HistoryItem
from app.models.store import store

router = APIRouter()

@router.get("/history", response_model=List[HistoryItem])
async def get_history():
    history_records = store.list_history()
    return [HistoryItem(**item) for item in history_records]
