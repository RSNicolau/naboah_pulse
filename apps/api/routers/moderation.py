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
    event = db.get(ModerationEvent, id)
    if not event:
        raise HTTPException(status_code=404, detail="Moderation event not found")
    if not event.reversible:
        raise HTTPException(status_code=400, detail="This action is not reversible")

    event.action_taken = "none"
    db.add(event)
    db.commit()
    db.refresh(event)
    return {"message": "Action reversed", "event_id": event.id, "new_action": event.action_taken}

@router.post("/crisis-mode")
async def set_crisis_mode(enabled: bool, db: Session = Depends(get_session)):
    TENANT_ID = "naboah"
    new_mode = "auto" if enabled else "semi"
    policies = db.exec(
        select(ModerationPolicy).where(ModerationPolicy.tenant_id == TENANT_ID)
    ).all()

    updated_count = 0
    for policy in policies:
        policy.mode = new_mode
        db.add(policy)
        updated_count += 1

    db.commit()
    return {
        "status": "Crisis mode " + ("enabled" if enabled else "disabled"),
        "mode_set": new_mode,
        "policies_updated": updated_count,
    }
