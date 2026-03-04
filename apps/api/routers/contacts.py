from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Contact, Conversation, Deal, Message, ChannelAccount
from typing import Optional

router = APIRouter(prefix="/contacts", tags=["contacts"])

TENANT_ID = "naboah"


@router.get("")
async def list_contacts(q: Optional[str] = None, db: Session = Depends(get_session)):
    contacts = db.exec(select(Contact).where(Contact.tenant_id == TENANT_ID)).all()
    result = []
    for c in contacts:
        convs = db.exec(select(Conversation).where(Conversation.contact_id == c.id)).all()
        channels = set()
        for conv in convs:
            acct = db.get(ChannelAccount, conv.channel_account_id)
            if acct:
                channels.add(acct.channel_id)

        deals = db.exec(select(Deal).where(Deal.contact_name == c.name)).all()
        deal_value = sum(d.value for d in deals)

        result.append({
            "id": c.id,
            "name": c.name or "Unknown",
            "email": c.email,
            "phone": c.phone,
            "health_score": c.health_score,
            "churn_risk_level": c.churn_risk_level,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "conversation_count": len(convs),
            "channels": list(channels),
            "deal_count": len(deals),
            "deal_value": deal_value,
        })

    if q:
        ql = q.lower()
        result = [
            r for r in result
            if ql in (r["name"] or "").lower()
            or ql in (r["email"] or "").lower()
            or ql in (r["phone"] or "").lower()
        ]

    result.sort(key=lambda x: -(x["health_score"] or 0))
    return result


@router.get("/{contact_id}")
async def get_contact(contact_id: str, db: Session = Depends(get_session)):
    contact = db.get(Contact, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contacto não encontrado")

    convs = db.exec(
        select(Conversation)
        .where(Conversation.contact_id == contact_id)
        .order_by(Conversation.updated_at.desc())
    ).all()

    conv_summaries = []
    for conv in convs:
        acct = db.get(ChannelAccount, conv.channel_account_id)
        channel = acct.channel_id if acct else "unknown"
        last_msg = db.exec(
            select(Message)
            .where(Message.conversation_id == conv.id)
            .order_by(Message.created_at.desc())
            .limit(1)
        ).first()
        conv_summaries.append({
            "id": conv.id,
            "channel": channel,
            "status": conv.status,
            "priority": conv.priority,
            "last_message": last_msg.content[:80] if last_msg else None,
            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
        })

    deals = db.exec(select(Deal).where(Deal.contact_name == contact.name)).all()

    return {
        "id": contact.id,
        "name": contact.name or "Unknown",
        "email": contact.email,
        "phone": contact.phone,
        "health_score": contact.health_score,
        "churn_risk_level": contact.churn_risk_level,
        "created_at": contact.created_at.isoformat() if contact.created_at else None,
        "conversations": conv_summaries,
        "deals": [
            {"id": d.id, "title": d.title, "value": d.value, "stage_id": d.stage_id, "status": d.status}
            for d in deals
        ],
    }
