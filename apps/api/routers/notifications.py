from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from db import get_session
from models import Conversation, Message, Ticket, Deal
from datetime import datetime, timedelta

router = APIRouter(prefix="/notifications", tags=["notifications"])

TENANT_ID = "naboah"

PRIORITY_ICON = {"urgent": "🔴", "high": "🟠", "medium": "🟡", "low": "⚪"}
CHANNEL_ICON = {"whatsapp": "💬", "instagram": "📸", "email": "📧"}


@router.get("/")
async def list_notifications(db: Session = Depends(get_session)):
    """Returns last 30 days of notable events as a notification feed."""
    cutoff = datetime.utcnow() - timedelta(days=7)
    items = []

    # Recent inbound messages (last 20)
    messages = db.exec(
        select(Message)
        .where(Message.tenant_id == TENANT_ID)
        .where(Message.direction == "inbound")
        .where(Message.created_at >= cutoff)
        .order_by(Message.created_at.desc())
        .limit(10)
    ).all()
    for m in messages:
        conv = db.get(Conversation, m.conversation_id)
        items.append({
            "id": f"msg_{m.id}",
            "type": "message",
            "icon": "💬",
            "title": "Nova mensagem recebida",
            "body": m.content[:80] + ("…" if len(m.content) > 80 else ""),
            "href": f"/inbox",
            "created_at": m.created_at.isoformat(),
            "priority": conv.priority if conv else "medium",
        })

    # New/open tickets (last 10)
    tickets = db.exec(
        select(Ticket)
        .where(Ticket.tenant_id == TENANT_ID)
        .where(Ticket.status.in_(["new", "open"]))
        .where(Ticket.created_at >= cutoff)
        .order_by(Ticket.created_at.desc())
        .limit(10)
    ).all()
    for t in tickets:
        items.append({
            "id": f"tkt_{t.id}",
            "type": "ticket",
            "icon": PRIORITY_ICON.get(t.priority, "🎫"),
            "title": f"Ticket {t.priority.upper()}: {t.subject}",
            "body": t.description[:80] + ("…" if len(t.description) > 80 else ""),
            "href": "/support",
            "created_at": t.created_at.isoformat(),
            "priority": t.priority,
        })

    # New deals (last 10)
    deals = db.exec(
        select(Deal)
        .where(Deal.tenant_id == TENANT_ID)
        .where(Deal.created_at >= cutoff)
        .order_by(Deal.created_at.desc())
        .limit(10)
    ).all()
    for d in deals:
        items.append({
            "id": f"deal_{d.id}",
            "type": "deal",
            "icon": "💼",
            "title": f"Novo deal: {d.title}",
            "body": f"{d.value:,.0f} {d.currency} · {d.status}",
            "href": "/sales",
            "created_at": d.created_at.isoformat(),
            "priority": "medium",
        })

    # New conversations (last 10)
    convs = db.exec(
        select(Conversation)
        .where(Conversation.tenant_id == TENANT_ID)
        .where(Conversation.created_at >= cutoff)
        .order_by(Conversation.created_at.desc())
        .limit(10)
    ).all()
    for c in convs:
        items.append({
            "id": f"conv_{c.id}",
            "type": "conversation",
            "icon": "🗨️",
            "title": "Nova conversa iniciada",
            "body": f"Status: {c.status} · Prioridade: {c.priority}",
            "href": "/inbox",
            "created_at": c.created_at.isoformat(),
            "priority": c.priority,
        })

    # Sort all by created_at desc, return top 25
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return items[:25]
