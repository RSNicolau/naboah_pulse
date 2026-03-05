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
    # Recebe eventos da Twilio/Vonage (simulado)
    # Ex: call.completed, recording.available, transcription.completed
    print(f"Call Event Received: {event.get('type')}")
    return {"status": "ok"}

@router.get("/voicemails", response_model=List[Voicemail])
async def list_voicemails(db: Session = Depends(get_session)):
    # Query Voicemail from DB
    voicemails = db.exec(
        select(Voicemail).where(Voicemail.tenant_id == TENANT_ID)
        .order_by(Voicemail.created_at.desc())
    ).all()
    return voicemails
