"""
Pulse Webhook Emitter — Sends HMAC-SHA256 signed events to registered subscribers.
Used to notify OmniMind (and other integrations) of CRM events.
"""
import asyncio
import hashlib
import hmac
import json
import uuid
from datetime import datetime

import httpx
from sqlmodel import Session, select

from db import engine
from models import WebhookSubscription, WebhookDispatchLog


def _id(prefix: str = "whd") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _sign(body: str, secret: str) -> str:
    """HMAC-SHA256 signature of the payload."""
    return hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()


async def emit_event(tenant_id: str, event_type: str, payload: dict):
    """Fire-and-forget: spawns a background task to deliver webhooks."""
    asyncio.create_task(_deliver_to_subscribers(tenant_id, event_type, payload))


async def _deliver_to_subscribers(tenant_id: str, event_type: str, payload: dict):
    """Find active subscriptions and deliver the event."""
    with Session(engine) as db:
        subs = db.exec(
            select(WebhookSubscription).where(
                WebhookSubscription.tenant_id == tenant_id,
                WebhookSubscription.is_active == True,
            )
        ).all()

        for sub in subs:
            events = sub.events_json or []
            if event_type in events or "*" in events:
                await _deliver_with_retry(db, sub, event_type, payload)


async def _deliver_with_retry(
    db: Session,
    subscription: WebhookSubscription,
    event_type: str,
    payload: dict,
    max_retries: int = 3,
):
    """Deliver a webhook with exponential backoff retry (1s, 4s, 16s)."""
    envelope = {
        "event": event_type,
        "data": payload,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
    body = json.dumps(envelope, default=str)
    delivery_id = uuid.uuid4().hex
    signature = _sign(body, subscription.secret_key)

    headers = {
        "Content-Type": "application/json",
        "X-Pulse-Event": event_type,
        "X-Pulse-Signature": f"sha256={signature}",
        "X-Pulse-Delivery": delivery_id,
    }

    for attempt in range(1, max_retries + 1):
        log = WebhookDispatchLog(
            id=_id(),
            tenant_id=subscription.tenant_id,
            subscription_id=subscription.id,
            event_type=event_type,
            payload_json=envelope,
            attempt=attempt,
            status="pending",
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    subscription.target_url, content=body, headers=headers
                )

            log.response_code = resp.status_code
            log.response_body = resp.text[:500] if resp.text else None

            if resp.status_code < 400:
                log.status = "delivered"
                subscription.last_delivery_at = datetime.utcnow()
                subscription.failure_count = 0
                db.add(subscription)
                db.add(log)
                db.commit()
                return
            else:
                log.status = "failed"
                log.error_message = f"HTTP {resp.status_code}"
        except Exception as e:
            log.status = "failed"
            log.error_message = str(e)[:500]

        db.add(log)
        db.commit()

        if attempt < max_retries:
            await asyncio.sleep(4 ** (attempt - 1))  # 1s, 4s, 16s

    # All retries exhausted
    subscription.failure_count += 1
    db.add(subscription)
    db.commit()
