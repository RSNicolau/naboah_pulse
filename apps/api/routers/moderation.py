from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import ModerationEvent, ModerationPolicy
from typing import List

router = APIRouter(prefix="/moderation", tags=["moderation"])

@router.get("/events")
async def list_events(db: Session = Depends(get_session)):
    events = db.exec(select(ModerationEvent).order_by(ModerationEvent.created_at.desc())).all()
    return events

@router.post("/events/{id}/undo")
async def undo_moderation(id: str, db: Session = Depends(get_session)):
    # Logic to reverse the action via API
    return {"message": "Action reversed"}

@router.post("/crisis-mode")
async def set_crisis_mode(enabled: bool):
    return {"status": "Crisis mode " + ("enabled" if enabled else "disabled")}
