from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import WidgetConfig, Message
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/horizon/widgets", tags=["widgets"])
configs_router = APIRouter(prefix="/widgets", tags=["widgets"])

TENANT_ID = "naboah"

class MessagePublic(BaseModel):
    sender_id: str
    content: str

@router.get("/", response_model=List[WidgetConfig])
async def list_widgets(db: Session = Depends(get_session)):
    widgets = db.exec(
        select(WidgetConfig).where(WidgetConfig.tenant_id == TENANT_ID)
    ).all()
    return widgets

@router.get("/{widget_id}/config")
async def get_widget_public_config(widget_id: str, db: Session = Depends(get_session)):
    # Query WidgetConfig from DB (public config, no tenant_id exposed)
    widget = db.get(WidgetConfig, widget_id)

    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    return {
        "id": widget.id,
        "name": widget.name,
        "primary_color": widget.primary_color,
        "accent_color": widget.accent_color,
        "logo_url": widget.logo_url,
        "welcome_message": widget.welcome_message,
        "is_active": widget.is_active,
        "collect_email": widget.collect_email,
        "allowed_domains": widget.allowed_domains_json,
    }

@router.post("/{widget_id}/sessions")
async def start_session(widget_id: str):
    return {
        "session_id": f"pub_{uuid.uuid4().hex[:8]}",
        "expires_in": 3600
    }

@router.post("/{widget_id}/messages")
async def send_public_message(widget_id: str, msg: MessagePublic, db: Session = Depends(get_session)):
    widget = db.get(WidgetConfig, widget_id)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    message_id = f"msg_{uuid.uuid4().hex[:8]}"
    new_message = Message(
        id=message_id,
        tenant_id=widget.tenant_id,
        conversation_id=f"widget_{widget_id}",
        external_message_id=message_id,
        direction="inbound",
        sender_type="contact",
        content=msg.content,
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {"status": "sent", "message_id": new_message.id}

@configs_router.get("/configs", response_model=List[WidgetConfig])
async def list_widget_configs(db: Session = Depends(get_session)):
    """List all widget configs for the current tenant."""
    widgets = db.exec(
        select(WidgetConfig).where(WidgetConfig.tenant_id == TENANT_ID)
    ).all()
    return widgets
