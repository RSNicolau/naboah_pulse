"""
OmniMind Integration Router — Endpoints that OmniMind calls to act on Pulse.
Protected by service-to-service auth (ServiceToken).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from db import get_session
from models import ServiceToken, Integration
from models_crm import (
    CRMContact, CRMDeal, CRMActivity, CRMCampaign,
    CRMPipeline, CRMStage, CRMAuditLog,
)
from services.service_auth import get_service_client, require_scope
from services.webhook_emitter import emit_event

router = APIRouter(prefix="/omnimind", tags=["omnimind"])

TENANT_ID = "naboah"


def _id(prefix: str = "omni") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _audit(db: Session, action: str, entity_type: str, entity_id: str,
           actor_id: str = "omnimind", before: dict = None, after: dict = None):
    log = CRMAuditLog(
        id=_id("aud"),
        tenant_id=TENANT_ID,
        actor_type="integration",
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before_json=before,
        after_json=after,
    )
    db.add(log)


# ─────────────────────────────────────────────
# STATUS
# ─────────────────────────────────────────────

@router.get("/status")
async def omnimind_status(db: Session = Depends(get_session)):
    """Health check — returns integration status."""
    integration = db.exec(
        select(Integration).where(
            Integration.tenant_id == TENANT_ID,
            Integration.provider == "omnimind",
        )
    ).first()

    return {
        "status": "connected" if integration else "not_configured",
        "provider": "omnimind",
        "tenant_id": TENANT_ID,
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ─────────────────────────────────────────────
# ACTIONS — CREATE LEAD
# ─────────────────────────────────────────────

class CreateLeadRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_e164: Optional[str] = None
    lead_score: Optional[int] = 0
    lifecycle_stage: Optional[str] = "lead"
    source: Optional[str] = "omnimind_ai"
    tags_json: Optional[list] = []
    metadata: Optional[dict] = {}


@router.post("/actions/create-lead")
async def create_lead(
    data: CreateLeadRequest,
    token: ServiceToken = Depends(require_scope("crm.contacts.write")),
    db: Session = Depends(get_session),
):
    contact = CRMContact(
        id=_id("cnt"),
        tenant_id=TENANT_ID,
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone_e164=data.phone_e164,
        lead_score=data.lead_score or 0,
        lifecycle_stage=data.lifecycle_stage or "lead",
        tags_json=data.tags_json or [],
        external_ids_json={"omnimind_source": data.source},
    )
    db.add(contact)
    _audit(db, "create", "contact", contact.id,
           actor_id=token.integration_id,
           after={"first_name": data.first_name, "email": data.email, "source": data.source})
    db.commit()
    db.refresh(contact)

    await emit_event(TENANT_ID, "lead.captured", {
        "contact_id": contact.id,
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "phone_e164": contact.phone_e164,
        "lead_score": contact.lead_score,
        "source": data.source,
    })

    return {"id": contact.id, "status": "created", "lead_score": contact.lead_score}


# ─────────────────────────────────────────────
# ACTIONS — UPDATE DEAL
# ─────────────────────────────────────────────

class UpdateDealRequest(BaseModel):
    stage_id: Optional[str] = None
    value: Optional[float] = None
    probability: Optional[int] = None
    expected_close_date: Optional[str] = None
    metadata: Optional[dict] = {}


@router.post("/actions/update-deal/{deal_id}")
async def update_deal(
    deal_id: str,
    data: UpdateDealRequest,
    token: ServiceToken = Depends(require_scope("crm.deals.write")),
    db: Session = Depends(get_session),
):
    deal = db.exec(
        select(CRMDeal).where(CRMDeal.id == deal_id, CRMDeal.tenant_id == TENANT_ID)
    ).first()
    if not deal:
        raise HTTPException(404, "Deal not found")

    before = {"stage_id": deal.stage_id, "value": deal.value}

    if data.stage_id:
        deal.stage_id = data.stage_id
    if data.value is not None:
        deal.value = data.value
    if data.probability is not None:
        deal.probability = data.probability

    deal.updated_at = datetime.utcnow()
    db.add(deal)
    _audit(db, "update", "deal", deal.id, actor_id=token.integration_id,
           before=before, after={"stage_id": deal.stage_id, "value": deal.value})
    db.commit()
    db.refresh(deal)

    await emit_event(TENANT_ID, "deal.updated", {
        "deal_id": deal.id, "stage_id": deal.stage_id, "value": deal.value,
    })

    return {"id": deal.id, "status": "updated"}


# ─────────────────────────────────────────────
# ACTIONS — PUBLISH CONTENT
# ─────────────────────────────────────────────

class PublishContentRequest(BaseModel):
    title: str
    body: str
    content_type: Optional[str] = "post"  # post, story, reel, article
    channels: Optional[list] = []
    scheduled_at: Optional[str] = None
    metadata: Optional[dict] = {}


@router.post("/actions/publish-content")
async def publish_content(
    data: PublishContentRequest,
    token: ServiceToken = Depends(require_scope("content.publish")),
    db: Session = Depends(get_session),
):
    # Store as CRMActivity of type "content_published"
    activity = CRMActivity(
        id=_id("act"),
        tenant_id=TENANT_ID,
        type="content_published",
        subject=data.title,
        body_json={"body": data.body, "content_type": data.content_type, "channels": data.channels},
    )
    db.add(activity)
    _audit(db, "create", "content", activity.id, actor_id=token.integration_id,
           after={"title": data.title, "type": data.content_type})
    db.commit()

    await emit_event(TENANT_ID, "content.published", {
        "activity_id": activity.id, "title": data.title, "type": data.content_type,
    })

    return {"id": activity.id, "status": "published"}


# ─────────────────────────────────────────────
# ACTIONS — SCHEDULE CAMPAIGN
# ─────────────────────────────────────────────

class ScheduleCampaignRequest(BaseModel):
    name: str
    channel: str = "whatsapp"  # whatsapp, sms, email
    type: str = "promotional"
    segment_id: Optional[str] = None
    content_json: Optional[dict] = {}
    scheduled_at: Optional[str] = None
    metadata: Optional[dict] = {}


@router.post("/actions/schedule-campaign")
async def schedule_campaign(
    data: ScheduleCampaignRequest,
    token: ServiceToken = Depends(require_scope("campaigns.write")),
    db: Session = Depends(get_session),
):
    campaign = CRMCampaign(
        id=_id("cmp"),
        tenant_id=TENANT_ID,
        name=data.name,
        channel=data.channel,
        type=data.type,
        segment_id=data.segment_id,
        content_json=data.content_json or {},
        status="scheduled",
    )
    db.add(campaign)
    _audit(db, "create", "campaign", campaign.id, actor_id=token.integration_id,
           after={"name": data.name, "channel": data.channel})
    db.commit()
    db.refresh(campaign)

    await emit_event(TENANT_ID, "campaign.scheduled", {
        "campaign_id": campaign.id, "name": data.name, "channel": data.channel,
    })

    return {"id": campaign.id, "status": "scheduled"}


# ─────────────────────────────────────────────
# ACTIONS — LOG INTERACTION
# ─────────────────────────────────────────────

class LogInteractionRequest(BaseModel):
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    type: str = "ai_interaction"
    subject: str
    body_json: Optional[dict] = {}
    agent_id: Optional[str] = None
    metadata: Optional[dict] = {}


@router.post("/actions/log-interaction")
async def log_interaction(
    data: LogInteractionRequest,
    token: ServiceToken = Depends(require_scope("crm.activities.write")),
    db: Session = Depends(get_session),
):
    activity = CRMActivity(
        id=_id("act"),
        tenant_id=TENANT_ID,
        contact_id=data.contact_id,
        deal_id=data.deal_id,
        type=data.type,
        subject=data.subject,
        body_json=data.body_json or {},
    )
    db.add(activity)
    _audit(db, "create", "activity", activity.id, actor_id=token.integration_id,
           after={"type": data.type, "subject": data.subject, "agent_id": data.agent_id})
    db.commit()

    return {"id": activity.id, "status": "logged"}


# ─────────────────────────────────────────────
# READ — GET CONTACT / DEAL
# ─────────────────────────────────────────────

@router.get("/actions/get-contact/{contact_id}")
async def get_contact(
    contact_id: str,
    token: ServiceToken = Depends(require_scope("crm.contacts.read")),
    db: Session = Depends(get_session),
):
    contact = db.exec(
        select(CRMContact).where(
            CRMContact.id == contact_id, CRMContact.tenant_id == TENANT_ID
        )
    ).first()
    if not contact:
        raise HTTPException(404, "Contact not found")

    return {
        "id": contact.id,
        "first_name": contact.first_name,
        "last_name": contact.last_name,
        "email": contact.email,
        "phone_e164": contact.phone_e164,
        "lead_score": contact.lead_score,
        "lifecycle_stage": contact.lifecycle_stage,
        "tags_json": contact.tags_json,
        "health_score": contact.health_score,
        "created_at": contact.created_at.isoformat() if contact.created_at else None,
    }


@router.get("/actions/get-deal/{deal_id}")
async def get_deal(
    deal_id: str,
    token: ServiceToken = Depends(require_scope("crm.deals.read")),
    db: Session = Depends(get_session),
):
    deal = db.exec(
        select(CRMDeal).where(
            CRMDeal.id == deal_id, CRMDeal.tenant_id == TENANT_ID
        )
    ).first()
    if not deal:
        raise HTTPException(404, "Deal not found")

    return {
        "id": deal.id,
        "title": deal.title,
        "value": deal.value,
        "currency": deal.currency,
        "stage_id": deal.stage_id,
        "contact_id": deal.contact_id,
        "probability": deal.probability,
        "expected_close_date": deal.expected_close_date.isoformat() if deal.expected_close_date else None,
        "created_at": deal.created_at.isoformat() if deal.created_at else None,
    }
