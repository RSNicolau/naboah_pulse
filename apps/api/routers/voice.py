from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import CallRecord, Voicemail
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/voice", tags=["voice"])

class CallCreate(BaseModel):
    to_number: str

@router.get("/history", response_model=List[CallRecord])
async def list_call_history(db: Session = Depends(get_session)):
    # Mock de histórico se nenhum existir
    calls = db.exec(select(CallRecord)).all()
    if not calls:
        return [
            CallRecord(id="call_1", tenant_id="t1", from_number="+551199999999", to_number="+551188888888", direction="outbound", duration_seconds=120, status="completed", sentiment_score=0.8),
            CallRecord(id="call_2", tenant_id="t1", from_number="+554877777777", to_number="+551199999999", direction="inbound", duration_seconds=60, status="completed", sentiment_score=-0.2),
            CallRecord(id="call_3", tenant_id="t1", from_number="+551155555555", to_number="+551199999999", direction="inbound", duration_seconds=0, status="missed"),
        ]
    return calls

@router.post("/dial")
async def initiate_call(data: CallCreate):
    # Simulação de sinalização WebRTC / Twilio
    call_id = f"call_{uuid.uuid4().hex[:8]}"
    return {
        "status": "initiating",
        "call_id": call_id,
        "token": "webrtc_token_mock_123"
    }

@router.post("/webhook/event")
async def call_event_webhook(event: dict, db: Session = Depends(get_session)):
    # Recebe eventos da Twilio/Vonage (simulado)
    # Ex: call.completed, recording.available, transcription.completed
    print(f"Call Event Received: {event.get('type')}")
    return {"status": "ok"}

@router.get("/voicemails", response_model=List[Voicemail])
async def list_voicemails(db: Session = Depends(get_session)):
    return [
        Voicemail(id="vm_1", tenant_id="t1", call_record_id="call_3", audio_url="http://storage/vm1.mp3", transcription="Olá, gostaria de saber sobre meu pedido.")
    ]
