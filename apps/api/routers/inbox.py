import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Conversation, Message, Contact, ChannelAccount, Channel
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/conversations", tags=["inbox"])


@router.get("/")
async def list_conversations(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_session),
):
    query = (
        select(Conversation, Contact)
        .join(Contact, Conversation.contact_id == Contact.id)
        .order_by(Conversation.updated_at.desc())
    )
    if status:
        query = query.where(Conversation.status == status)
    if priority:
        query = query.where(Conversation.priority == priority)

    results = db.exec(query).all()
    output = []
    for conv, contact in results:
        last_msg = db.exec(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        ).first()

        channel_type = "chat"
        acct = db.get(ChannelAccount, conv.channel_account_id)
        if acct:
            ch = db.get(Channel, acct.channel_id)
            if ch:
                channel_type = ch.type

        output.append({
            "id": conv.id,
            "contact_name": contact.name or contact.email or "Unknown",
            "contact_id": conv.contact_id,
            "contact_phone": contact.phone,
            "channel": channel_type,
            "status": conv.status,
            "priority": conv.priority,
            "intent": conv.intent,
            "last_message": last_msg.content[:100] if last_msg else "",
            "updated_at": (last_msg.created_at if last_msg else conv.updated_at).isoformat(),
        })

    return output


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str, db: Session = Depends(get_session)):
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    contact = db.get(Contact, conv.contact_id)
    return {
        "id": conv.id,
        "contact_name": contact.name if contact else "Unknown",
        "contact_email": contact.email if contact else None,
        "contact_phone": contact.phone if contact else None,
        "status": conv.status,
        "priority": conv.priority,
        "intent": conv.intent,
        "created_at": conv.created_at.isoformat(),
    }


@router.get("/{conversation_id}/messages")
async def list_messages(conversation_id: str, db: Session = Depends(get_session)):
    messages = db.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()
    return [
        {
            "id": m.id,
            "content": m.content,
            "direction": m.direction,
            "sender_type": m.sender_type,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@router.patch("/{conversation_id}/resolve")
async def resolve_conversation(conversation_id: str, db: Session = Depends(get_session)):
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.status = "resolved"
    conv.updated_at = datetime.utcnow()
    db.add(conv)
    db.commit()
    return {"id": conv.id, "status": conv.status}


@router.patch("/{conversation_id}/reopen")
async def reopen_conversation(conversation_id: str, db: Session = Depends(get_session)):
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.status = "open"
    conv.updated_at = datetime.utcnow()
    db.add(conv)
    db.commit()
    return {"id": conv.id, "status": conv.status}


class PriorityUpdate(BaseModel):
    priority: str


@router.patch("/{conversation_id}/priority")
async def update_priority(conversation_id: str, req: PriorityUpdate, db: Session = Depends(get_session)):
    if req.priority not in ("low", "medium", "high", "urgent"):
        raise HTTPException(status_code=400, detail="Invalid priority")
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conv.priority = req.priority
    conv.updated_at = datetime.utcnow()
    db.add(conv)
    db.commit()
    return {"id": conv.id, "priority": conv.priority}


@router.post("/{conversation_id}/reply")
async def reply(conversation_id: str, reply_data: dict, db: Session = Depends(get_session)):
    conv = db.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    content = reply_data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Content is required")

    msg = Message(
        id=str(uuid.uuid4()),
        tenant_id=conv.tenant_id,
        conversation_id=conversation_id,
        external_message_id=str(uuid.uuid4()),
        direction="outbound",
        sender_type=reply_data.get("sender_type", "user"),
        content=content,
    )
    db.add(msg)
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "content": msg.content,
        "direction": msg.direction,
        "sender_type": msg.sender_type,
        "created_at": msg.created_at.isoformat(),
    }
