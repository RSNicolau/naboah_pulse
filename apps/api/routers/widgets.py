from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import WidgetConfig
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/horizon/widgets", tags=["widgets"])

class MessagePublic(BaseModel):
    sender_id: str
    content: str

@router.get("/", response_model=List[WidgetConfig])
async def list_widgets(db: Session = Depends(get_session)):
    widgets = db.exec(select(WidgetConfig)).all()
    if not widgets:
        return [
            WidgetConfig(
                id="w_1", 
                tenant_id="t1", 
                name="Chat Principal Site", 
                allowed_domains_json=["naboah.com", "localhost:3000"]
            )
        ]
    return widgets

@router.get("/{widget_id}/config")
async def get_widget_public_config(widget_id: str, db: Session = Depends(get_session)):
    # Simulação de retorno de configuração pública (sem expor tenant_id diretamente)
    return {
        "id": widget_id,
        "primary_color": "#7C3AED",
        "welcome_message": "Olá! Sou o Jarvis, assistente da Naboah.",
        "features": ["attachments", "voice_notes"]
    }

@router.post("/{widget_id}/sessions")
async def start_session(widget_id: str):
    return {
        "session_id": f"pub_{uuid.uuid4().hex[:8]}",
        "expires_in": 3600
    }

@router.post("/{widget_id}/messages")
async def send_public_message(widget_id: str, msg: MessagePublic):
    return {"status": "sent", "message_id": f"msg_{uuid.uuid4().hex[:6]}"}
