from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from db import get_session
from models import ChannelAccount, Channel

router = APIRouter(prefix="/integrations", tags=["integrations"])

TENANT_ID = "naboah"

CHANNEL_META = {
    "whatsapp":  {"label": "WhatsApp",  "color": "#25D366", "type": "Messaging"},
    "instagram": {"label": "Instagram", "color": "#E1306C", "type": "Social"},
    "email":     {"label": "Email",     "color": "#4285F4", "type": "Email"},
    "facebook":  {"label": "Facebook",  "color": "#1877F2", "type": "Messaging"},
    "telegram":  {"label": "Telegram",  "color": "#2AABEE", "type": "Messaging"},
}


@router.get("/channels")
async def list_channel_accounts(db: Session = Depends(get_session)):
    accounts = db.exec(
        select(ChannelAccount).where(ChannelAccount.tenant_id == TENANT_ID)
    ).all()

    result = []
    for acc in accounts:
        ch = db.get(Channel, acc.channel_id)
        ch_type = ch.type if ch else "unknown"
        meta = CHANNEL_META.get(ch_type, {"label": ch_type.capitalize(), "color": "#888", "type": "Other"})
        result.append({
            "id": acc.id,
            "channel_type": ch_type,
            "label": meta["label"],
            "color": meta["color"],
            "type": meta["type"],
            "external_account_id": acc.external_account_id,
            "status": acc.status,
            "health_metrics": acc.health_metrics,
            "created_at": acc.created_at,
        })
    return result
