"""
Integrations Router — Channel accounts + Integration CRUD + Tokens + Webhooks.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
import hashlib
import secrets

from db import get_session
from models import (
    ChannelAccount, Channel, Integration,
    WebhookSubscription, WebhookDispatchLog, ServiceToken,
)

router = APIRouter(prefix="/integrations", tags=["integrations"])

TENANT_ID = "naboah"

CHANNEL_META = {
    "whatsapp":  {"label": "WhatsApp",  "color": "#25D366", "type": "Messaging"},
    "instagram": {"label": "Instagram", "color": "#E1306C", "type": "Social"},
    "email":     {"label": "Email",     "color": "#4285F4", "type": "Email"},
    "facebook":  {"label": "Facebook",  "color": "#1877F2", "type": "Messaging"},
    "telegram":  {"label": "Telegram",  "color": "#2AABEE", "type": "Messaging"},
}


def _id(prefix: str = "int") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ─────────────────────────────────────────────
# CHANNELS (existing)
# ─────────────────────────────────────────────

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


# ─────────────────────────────────────────────
# INTEGRATIONS CRUD
# ─────────────────────────────────────────────

class IntegrationConnect(BaseModel):
    provider: str  # omnimind, hubspot, salesforce, etc.
    type: str = "ai"  # ai, crm, ads, automation
    config: Optional[dict] = {}


@router.post("/connect")
async def connect_integration(data: IntegrationConnect, db: Session = Depends(get_session)):
    """Create a new integration connection."""
    existing = db.exec(
        select(Integration).where(
            Integration.tenant_id == TENANT_ID,
            Integration.provider == data.provider,
        )
    ).first()
    if existing:
        raise HTTPException(409, f"Integration '{data.provider}' already connected")

    integration = Integration(
        id=_id("int"),
        tenant_id=TENANT_ID,
        provider=data.provider,
        type=data.type,
        status="connected",
        config_json_encrypted=str(data.config),
    )
    db.add(integration)
    db.commit()
    db.refresh(integration)

    return {
        "id": integration.id, "provider": integration.provider,
        "type": integration.type, "status": integration.status,
    }


@router.get("")
async def list_integrations(db: Session = Depends(get_session)):
    """List all integrations for the tenant."""
    items = db.exec(
        select(Integration).where(Integration.tenant_id == TENANT_ID)
    ).all()
    return [
        {
            "id": i.id, "provider": i.provider, "type": i.type,
            "status": i.status, "created_at": i.created_at,
        }
        for i in items
    ]


@router.delete("/{integration_id}/disconnect")
async def disconnect_integration(integration_id: str, db: Session = Depends(get_session)):
    """Soft-disconnect an integration."""
    integration = db.exec(
        select(Integration).where(
            Integration.id == integration_id, Integration.tenant_id == TENANT_ID
        )
    ).first()
    if not integration:
        raise HTTPException(404, "Integration not found")

    integration.status = "disconnected"
    db.add(integration)
    db.commit()
    return {"id": integration.id, "status": "disconnected"}


@router.get("/{integration_id}/health")
async def integration_health(integration_id: str, db: Session = Depends(get_session)):
    """Check integration connectivity status."""
    integration = db.exec(
        select(Integration).where(
            Integration.id == integration_id, Integration.tenant_id == TENANT_ID
        )
    ).first()
    if not integration:
        raise HTTPException(404, "Integration not found")

    # Count active tokens and subscriptions
    tokens = db.exec(
        select(ServiceToken).where(
            ServiceToken.integration_id == integration_id,
            ServiceToken.is_active == True,
        )
    ).all()
    subs = db.exec(
        select(WebhookSubscription).where(
            WebhookSubscription.integration_id == integration_id,
            WebhookSubscription.is_active == True,
        )
    ).all()

    return {
        "id": integration.id,
        "provider": integration.provider,
        "status": integration.status,
        "active_tokens": len(tokens),
        "active_subscriptions": len(subs),
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─────────────────────────────────────────────
# SERVICE TOKENS
# ─────────────────────────────────────────────

class TokenCreate(BaseModel):
    name: str  # "OmniMind Production"
    scopes: List[str] = ["*"]  # ["crm.contacts.read", "crm.deals.write", ...]


@router.post("/{integration_id}/tokens")
async def create_token(
    integration_id: str, data: TokenCreate, db: Session = Depends(get_session)
):
    """Generate a new service token for this integration."""
    integration = db.exec(
        select(Integration).where(
            Integration.id == integration_id, Integration.tenant_id == TENANT_ID
        )
    ).first()
    if not integration:
        raise HTTPException(404, "Integration not found")

    raw_token = f"pulse_sk_{secrets.token_hex(32)}"
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

    st = ServiceToken(
        id=_id("stk"),
        tenant_id=TENANT_ID,
        integration_id=integration_id,
        token_hash=token_hash,
        name=data.name,
        scopes_json=data.scopes,
    )
    db.add(st)
    db.commit()

    # Return the raw token ONCE — it cannot be retrieved again
    return {
        "id": st.id,
        "token": raw_token,
        "name": st.name,
        "scopes": st.scopes_json,
        "warning": "Save this token — it will not be shown again.",
    }


@router.get("/{integration_id}/tokens")
async def list_tokens(integration_id: str, db: Session = Depends(get_session)):
    """List tokens for an integration (hashes only, no raw tokens)."""
    tokens = db.exec(
        select(ServiceToken).where(
            ServiceToken.integration_id == integration_id,
            ServiceToken.tenant_id == TENANT_ID,
        )
    ).all()
    return [
        {
            "id": t.id, "name": t.name, "scopes": t.scopes_json,
            "is_active": t.is_active, "last_used_at": t.last_used_at,
            "created_at": t.created_at,
        }
        for t in tokens
    ]


@router.delete("/{integration_id}/tokens/{token_id}")
async def revoke_token(
    integration_id: str, token_id: str, db: Session = Depends(get_session)
):
    """Revoke a service token."""
    token = db.exec(
        select(ServiceToken).where(
            ServiceToken.id == token_id,
            ServiceToken.integration_id == integration_id,
            ServiceToken.tenant_id == TENANT_ID,
        )
    ).first()
    if not token:
        raise HTTPException(404, "Token not found")

    token.is_active = False
    db.add(token)
    db.commit()
    return {"id": token.id, "status": "revoked"}


# ─────────────────────────────────────────────
# WEBHOOK SUBSCRIPTIONS
# ─────────────────────────────────────────────

class WebhookCreate(BaseModel):
    target_url: str
    events: List[str] = ["*"]  # ["lead.captured", "deal.updated", ...]
    secret_key: Optional[str] = None  # Auto-generated if not provided


@router.post("/{integration_id}/webhooks")
async def create_webhook(
    integration_id: str, data: WebhookCreate, db: Session = Depends(get_session)
):
    """Register a webhook subscription for this integration."""
    integration = db.exec(
        select(Integration).where(
            Integration.id == integration_id, Integration.tenant_id == TENANT_ID
        )
    ).first()
    if not integration:
        raise HTTPException(404, "Integration not found")

    secret = data.secret_key or secrets.token_hex(32)

    sub = WebhookSubscription(
        id=_id("wsub"),
        tenant_id=TENANT_ID,
        integration_id=integration_id,
        target_url=data.target_url,
        secret_key=secret,
        events_json=data.events,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)

    return {
        "id": sub.id,
        "target_url": sub.target_url,
        "events": sub.events_json,
        "secret_key": secret,
        "warning": "Save this secret — it will not be shown again.",
    }


@router.get("/{integration_id}/webhooks")
async def list_webhooks(integration_id: str, db: Session = Depends(get_session)):
    """List webhook subscriptions for an integration."""
    subs = db.exec(
        select(WebhookSubscription).where(
            WebhookSubscription.integration_id == integration_id,
            WebhookSubscription.tenant_id == TENANT_ID,
        )
    ).all()
    return [
        {
            "id": s.id, "target_url": s.target_url, "events": s.events_json,
            "is_active": s.is_active, "failure_count": s.failure_count,
            "last_delivery_at": s.last_delivery_at, "created_at": s.created_at,
        }
        for s in subs
    ]


@router.patch("/{integration_id}/webhooks/{sub_id}")
async def toggle_webhook(
    integration_id: str, sub_id: str, db: Session = Depends(get_session)
):
    """Toggle a webhook subscription active/inactive."""
    sub = db.exec(
        select(WebhookSubscription).where(
            WebhookSubscription.id == sub_id,
            WebhookSubscription.integration_id == integration_id,
            WebhookSubscription.tenant_id == TENANT_ID,
        )
    ).first()
    if not sub:
        raise HTTPException(404, "Webhook subscription not found")

    sub.is_active = not sub.is_active
    db.add(sub)
    db.commit()
    return {"id": sub.id, "is_active": sub.is_active}


@router.delete("/{integration_id}/webhooks/{sub_id}")
async def delete_webhook(
    integration_id: str, sub_id: str, db: Session = Depends(get_session)
):
    """Remove a webhook subscription."""
    sub = db.exec(
        select(WebhookSubscription).where(
            WebhookSubscription.id == sub_id,
            WebhookSubscription.integration_id == integration_id,
            WebhookSubscription.tenant_id == TENANT_ID,
        )
    ).first()
    if not sub:
        raise HTTPException(404, "Webhook subscription not found")

    db.delete(sub)
    db.commit()
    return {"status": "deleted"}


@router.get("/{integration_id}/webhooks/logs")
async def webhook_logs(
    integration_id: str,
    limit: int = 20,
    db: Session = Depends(get_session),
):
    """Recent webhook delivery logs for an integration."""
    # Get subscription IDs for this integration
    subs = db.exec(
        select(WebhookSubscription).where(
            WebhookSubscription.integration_id == integration_id,
            WebhookSubscription.tenant_id == TENANT_ID,
        )
    ).all()
    sub_ids = [s.id for s in subs]
    if not sub_ids:
        return []

    logs = db.exec(
        select(WebhookDispatchLog)
        .where(WebhookDispatchLog.subscription_id.in_(sub_ids))
        .order_by(WebhookDispatchLog.created_at.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": l.id, "event_type": l.event_type, "status": l.status,
            "response_code": l.response_code, "attempt": l.attempt,
            "error_message": l.error_message, "created_at": l.created_at,
        }
        for l in logs
    ]
