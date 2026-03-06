from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import CallRecord, Voicemail
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/voice", tags=["voice"])

TENANT_ID = "naboah"

class CallCreate(BaseModel):
    to_number: str

@router.get("/history", response_model=List[CallRecord])
async def list_call_history(db: Session = Depends(get_session)):
    calls = db.exec(
        select(CallRecord)
        .where(CallRecord.tenant_id == TENANT_ID)
        .order_by(CallRecord.created_at.desc())
    ).all()
    return calls

@router.post("/dial")
async def initiate_call(data: CallCreate, db: Session = Depends(get_session)):
    call_id = f"call_{uuid.uuid4().hex[:8]}"
    new_call = CallRecord(
        id=call_id,
        tenant_id=TENANT_ID,
        from_number="tenant_line",
        to_number=data.to_number,
        direction="outbound",
        duration_seconds=0,
        status="initiating",
    )
    db.add(new_call)
    db.commit()
    db.refresh(new_call)
    return {
        "status": "initiating",
        "call_id": new_call.id,
        "call": new_call,
    }

@router.post("/webhook/event")
async def call_event_webhook(event: dict, db: Session = Depends(get_session)):
    # Process call events from Twilio/Vonage
    event_type = event.get("type", "unknown")
    call_id = event.get("call_id")

    if call_id:
        call = db.get(CallRecord, call_id)
        if call:
            if event_type == "call.completed":
                call.status = "completed"
                call.duration_seconds = event.get("duration", 0)
            elif event_type == "call.failed":
                call.status = "failed"
            elif event_type == "call.ringing":
                call.status = "ringing"
            elif event_type == "call.answered":
                call.status = "in_progress"
            elif event_type == "recording.available":
                call.recording_url = event.get("recording_url")
            elif event_type == "transcription.completed":
                call.transcription = event.get("transcription")
            db.add(call)
            db.commit()

    return {"status": "processed", "event_type": event_type, "call_id": call_id}

@router.get("/voicemails", response_model=List[Voicemail])
async def list_voicemails(db: Session = Depends(get_session)):
    # Query Voicemail from DB
    voicemails = db.exec(
        select(Voicemail).where(Voicemail.tenant_id == TENANT_ID)
        .order_by(Voicemail.created_at.desc())
    ).all()
    return voicemails
