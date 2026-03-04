from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from db import get_session
from models import Contact, Conversation, Deal, Ticket, ChannelAccount, Channel

router = APIRouter(prefix="/search", tags=["search"])

TENANT_ID = "naboah"


@router.get("/")
async def global_search(q: str, db: Session = Depends(get_session)):
    if not q or len(q.strip()) < 2:
        return {"contacts": [], "conversations": [], "deals": [], "tickets": []}

    term = q.strip().lower()

    # --- Contacts ---
    contacts = db.exec(
        select(Contact).where(Contact.tenant_id == TENANT_ID).limit(200)
    ).all()
    contact_hits = []
    for c in contacts:
        if (
            (c.name and term in c.name.lower()) or
            (c.email and term in c.email.lower()) or
            (c.phone and term in c.phone.lower())
        ):
            contact_hits.append({
                "id": c.id,
                "type": "contact",
                "title": c.name or c.email or c.phone or c.id,
                "subtitle": c.email or c.phone or "",
                "meta": c.churn_risk_level,
                "href": "/contacts",
            })

    # --- Conversations (search by contact name/channel/status) ---
    convs = db.exec(
        select(Conversation)
        .where(Conversation.tenant_id == TENANT_ID)
        .order_by(Conversation.updated_at.desc())
        .limit(300)
    ).all()
    conv_hits = []
    for conv in convs:
        contact = db.get(Contact, conv.contact_id)
        contact_name = (contact.name or contact.email or "") if contact else ""
        acct = db.get(ChannelAccount, conv.channel_account_id)
        ch_name = ""
        if acct:
            ch = db.get(Channel, acct.channel_id)
            ch_name = ch.name if ch else ""

        if (
            term in contact_name.lower() or
            term in conv.status.lower() or
            term in ch_name.lower() or
            term in conv.priority.lower()
        ):
            conv_hits.append({
                "id": conv.id,
                "type": "conversation",
                "title": contact_name or "Conversa",
                "subtitle": f"{ch_name} · {conv.status} · {conv.priority}",
                "meta": conv.priority,
                "href": "/inbox",
            })

    # --- Deals ---
    deals = db.exec(
        select(Deal).where(Deal.tenant_id == TENANT_ID).limit(200)
    ).all()
    deal_hits = []
    for d in deals:
        if (
            term in d.title.lower() or
            (d.contact_name and term in d.contact_name.lower()) or
            (d.contact_email and term in d.contact_email.lower())
        ):
            deal_hits.append({
                "id": d.id,
                "type": "deal",
                "title": d.title,
                "subtitle": f"{d.value:,.0f} {d.currency} · {d.status}",
                "meta": d.status,
                "href": "/sales",
            })

    # --- Tickets ---
    tickets = db.exec(
        select(Ticket).where(Ticket.tenant_id == TENANT_ID).limit(200)
    ).all()
    ticket_hits = []
    for t in tickets:
        if term in t.subject.lower() or term in t.description.lower():
            ticket_hits.append({
                "id": t.id,
                "type": "ticket",
                "title": t.subject,
                "subtitle": f"#{t.id[:8]} · {t.priority} · {t.status}",
                "meta": t.priority,
                "href": "/support",
            })

    return {
        "contacts":      contact_hits[:5],
        "conversations": conv_hits[:5],
        "deals":         deal_hits[:5],
        "tickets":       ticket_hits[:5],
    }


@router.get("/actions")
async def get_quick_actions():
    return [
        {"label": "Unified Inbox",  "shortcut": "I", "href": "/inbox",             "icon": "inbox"},
        {"label": "Sales CRM",      "shortcut": "S", "href": "/sales",             "icon": "kanban"},
        {"label": "Helpdesk",       "shortcut": "H", "href": "/support",           "icon": "ticket"},
        {"label": "Contacts",       "shortcut": "C", "href": "/contacts",          "icon": "users"},
        {"label": "Analytics",      "shortcut": "A", "href": "/analytics/reports", "icon": "chart"},
        {"label": "Automation",     "shortcut": "U", "href": "/automation",        "icon": "zap"},
        {"label": "Billing",        "shortcut": "B", "href": "/billing",           "icon": "card"},
        {"label": "White-label",    "shortcut": "W", "href": "/settings/branding", "icon": "palette"},
    ]
