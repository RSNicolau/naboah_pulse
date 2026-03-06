"""
Pulse CRM Router — Full CRUD + Timeline + Pipeline + Segments + Repediu + AI Center
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from db import get_session
from models_crm import (
    CRMContact, CRMCompany, CRMContactCompany,
    CRMPipeline, CRMStage, CRMDeal,
    CRMActivity, CRMTicket, CRMOrder,
    CRMSegment, CRMRFMSnapshot,
    RepediuConnection, RepediuWebhookEvent,
    AICenter, CRMRole, CRMMembership, CRMAuditLog,
    AutonomyPolicy, CostBudget,
    CRMCampaign, CRMCampaignEvent,
    IdempotencyRecord, N8NDispatch,
)
from models import PersonaProfile, KnowledgePack, VoiceProfile
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import os
import uuid
import hashlib
from services.webhook_emitter import emit_event

router = APIRouter(prefix="/crm", tags=["crm"])

TENANT_ID = "naboah"


def _id(prefix: str = "crm") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def _audit(db: Session, action: str, entity_type: str, entity_id: str,
           actor_id: str = "system", before: dict = None, after: dict = None):
    log = CRMAuditLog(
        id=_id("aud"),
        tenant_id=TENANT_ID,
        actor_type="user" if actor_id != "system" else "system",
        actor_id=actor_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        before_json=before,
        after_json=after,
    )
    db.add(log)


# ─────────────────────────────────────────────
# CONTACTS
# ─────────────────────────────────────────────

class ContactCreate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_e164: Optional[str] = None
    email: Optional[str] = None
    document_id: Optional[str] = None
    tags_json: Optional[list] = []
    lifecycle_stage: Optional[str] = "lead"
    external_ids_json: Optional[dict] = {}
    consent_json: Optional[dict] = {}
    preferences_json: Optional[dict] = {}


class ContactUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_e164: Optional[str] = None
    email: Optional[str] = None
    document_id: Optional[str] = None
    tags_json: Optional[list] = None
    lifecycle_stage: Optional[str] = None
    lead_score: Optional[int] = None
    consent_json: Optional[dict] = None
    preferences_json: Optional[dict] = None


@router.get("/contacts")
async def list_contacts(
    lifecycle_stage: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_session),
):
    q = select(CRMContact).where(
        CRMContact.tenant_id == TENANT_ID,
        CRMContact.is_deleted == False,
    )
    if lifecycle_stage:
        q = q.where(CRMContact.lifecycle_stage == lifecycle_stage)
    if search:
        q = q.where(
            (CRMContact.first_name.ilike(f"%{search}%")) |
            (CRMContact.last_name.ilike(f"%{search}%")) |
            (CRMContact.email.ilike(f"%{search}%")) |
            (CRMContact.phone_e164.ilike(f"%{search}%"))
        )
    q = q.order_by(CRMContact.updated_at.desc()).offset(offset).limit(limit)
    return db.exec(q).all()


@router.post("/contacts")
async def upsert_contact(data: ContactCreate, db: Session = Depends(get_session)):
    # Dedup: check phone or email
    existing = None
    if data.phone_e164:
        existing = db.exec(
            select(CRMContact).where(
                CRMContact.tenant_id == TENANT_ID,
                CRMContact.phone_e164 == data.phone_e164,
                CRMContact.is_deleted == False,
            )
        ).first()
    if not existing and data.email:
        existing = db.exec(
            select(CRMContact).where(
                CRMContact.tenant_id == TENANT_ID,
                CRMContact.email == data.email,
                CRMContact.is_deleted == False,
            )
        ).first()

    if existing:
        # Update existing
        before = {"first_name": existing.first_name, "last_name": existing.last_name}
        for k, v in data.model_dump(exclude_none=True).items():
            setattr(existing, k, v)
        existing.updated_at = datetime.utcnow()
        db.add(existing)
        _audit(db, "update", "contact", existing.id, after=data.model_dump(exclude_none=True), before=before)
        db.commit()
        db.refresh(existing)
        return existing

    contact = CRMContact(
        id=_id("cnt"),
        tenant_id=TENANT_ID,
        **data.model_dump(),
    )
    db.add(contact)
    _audit(db, "create", "contact", contact.id, after=data.model_dump())
    db.commit()
    db.refresh(contact)
    await emit_event(TENANT_ID, "lead.captured", {
        "contact_id": contact.id, "first_name": contact.first_name,
        "last_name": contact.last_name, "email": contact.email,
        "phone_e164": contact.phone_e164, "lifecycle_stage": contact.lifecycle_stage,
    })
    return contact


@router.get("/contacts/{contact_id}")
async def get_contact(contact_id: str, db: Session = Depends(get_session)):
    c = db.get(CRMContact, contact_id)
    if not c or c.is_deleted:
        raise HTTPException(404, "Contact not found")
    return c


@router.put("/contacts/{contact_id}")
async def update_contact(contact_id: str, data: ContactUpdate, db: Session = Depends(get_session)):
    c = db.get(CRMContact, contact_id)
    if not c or c.is_deleted:
        raise HTTPException(404, "Contact not found")
    before = {"first_name": c.first_name, "lifecycle_stage": c.lifecycle_stage}
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(c, k, v)
    c.updated_at = datetime.utcnow()
    db.add(c)
    _audit(db, "update", "contact", c.id, before=before, after=data.model_dump(exclude_none=True))
    db.commit()
    db.refresh(c)
    return c


@router.post("/contacts/{contact_id}/merge")
async def merge_contacts(contact_id: str, merge_with_id: str = Query(...), db: Session = Depends(get_session)):
    primary = db.get(CRMContact, contact_id)
    secondary = db.get(CRMContact, merge_with_id)
    if not primary or not secondary:
        raise HTTPException(404, "Contact not found")
    # Merge: keep primary, move secondary's data
    if not primary.email and secondary.email:
        primary.email = secondary.email
    if not primary.phone_e164 and secondary.phone_e164:
        primary.phone_e164 = secondary.phone_e164
    if not primary.first_name and secondary.first_name:
        primary.first_name = secondary.first_name
    # Merge tags
    merged_tags = list(set((primary.tags_json or []) + (secondary.tags_json or [])))
    primary.tags_json = merged_tags
    primary.updated_at = datetime.utcnow()
    secondary.is_deleted = True
    db.add(primary)
    db.add(secondary)
    # Move activities, deals, tickets, orders to primary
    for model in [CRMActivity, CRMDeal, CRMTicket, CRMOrder]:
        items = db.exec(select(model).where(model.contact_id == merge_with_id)).all()
        for item in items:
            item.contact_id = contact_id
            db.add(item)
    _audit(db, "merge", "contact", contact_id,
           after={"merged_from": merge_with_id, "merged_tags": merged_tags},
           before={"secondary_id": merge_with_id})
    db.commit()
    db.refresh(primary)
    return primary


@router.get("/contacts/{contact_id}/timeline")
async def contact_timeline(contact_id: str, limit: int = 50, db: Session = Depends(get_session)):
    activities = db.exec(
        select(CRMActivity)
        .where(CRMActivity.contact_id == contact_id)
        .order_by(CRMActivity.created_at.desc())
        .limit(limit)
    ).all()
    orders = db.exec(
        select(CRMOrder)
        .where(CRMOrder.contact_id == contact_id)
        .order_by(CRMOrder.ordered_at.desc())
        .limit(20)
    ).all()
    deals = db.exec(
        select(CRMDeal)
        .where(CRMDeal.contact_id == contact_id)
        .order_by(CRMDeal.created_at.desc())
        .limit(20)
    ).all()
    tickets = db.exec(
        select(CRMTicket)
        .where(CRMTicket.contact_id == contact_id)
        .order_by(CRMTicket.created_at.desc())
        .limit(20)
    ).all()

    timeline = []
    for a in activities:
        timeline.append({"type": "activity", "subtype": a.type, "subject": a.subject, "body": a.body, "date": a.created_at.isoformat(), "id": a.id, "status": a.status})
    for o in orders:
        timeline.append({"type": "order", "subtype": o.provider, "subject": f"Order #{o.external_order_id or o.id}", "body": f"{o.total_cents / 100:.2f} {o.currency}", "date": o.ordered_at.isoformat(), "id": o.id})
    for d in deals:
        timeline.append({"type": "deal", "subtype": d.source, "subject": d.title, "body": f"{(d.value_cents or 0) / 100:.2f} {d.currency}", "date": d.created_at.isoformat(), "id": d.id, "status": d.status})
    for t in tickets:
        timeline.append({"type": "ticket", "subtype": t.category, "subject": t.summary, "body": t.details, "date": t.created_at.isoformat(), "id": t.id, "status": t.status})

    timeline.sort(key=lambda x: x["date"], reverse=True)
    return timeline


# ─────────────────────────────────────────────
# COMPANIES
# ─────────────────────────────────────────────

class CompanyCreate(BaseModel):
    name: str
    domain: Optional[str] = None
    document_id: Optional[str] = None
    tags_json: Optional[list] = []
    notes: Optional[str] = None


@router.get("/companies")
async def list_companies(db: Session = Depends(get_session)):
    return db.exec(
        select(CRMCompany)
        .where(CRMCompany.tenant_id == TENANT_ID, CRMCompany.is_deleted == False)
        .order_by(CRMCompany.name)
    ).all()


@router.post("/companies")
async def create_company(data: CompanyCreate, db: Session = Depends(get_session)):
    company = CRMCompany(id=_id("cmp"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(company)
    _audit(db, "create", "company", company.id, after=data.model_dump())
    db.commit()
    db.refresh(company)
    return company


@router.put("/companies/{company_id}")
async def update_company(company_id: str, data: CompanyCreate, db: Session = Depends(get_session)):
    c = db.get(CRMCompany, company_id)
    if not c or c.is_deleted:
        raise HTTPException(404, "Company not found")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(c, k, v)
    c.updated_at = datetime.utcnow()
    db.add(c)
    _audit(db, "update", "company", c.id, after=data.model_dump())
    db.commit()
    db.refresh(c)
    return c


# ─────────────────────────────────────────────
# PIPELINES & DEALS
# ─────────────────────────────────────────────

class PipelineCreate(BaseModel):
    name: str
    is_default: bool = False


class StageCreate(BaseModel):
    name: str
    order_index: int = 0
    sla_hours: Optional[int] = None
    probability: Optional[float] = None
    is_won: bool = False
    is_lost: bool = False
    color: Optional[str] = None


class DealCreate(BaseModel):
    pipeline_id: str
    stage_id: str
    title: str
    value_cents: Optional[int] = None
    currency: str = "BRL"
    source: Optional[str] = None
    contact_id: Optional[str] = None
    company_id: Optional[str] = None


class DealUpdate(BaseModel):
    title: Optional[str] = None
    value_cents: Optional[int] = None
    lead_score: Optional[int] = None
    source: Optional[str] = None
    contact_id: Optional[str] = None
    company_id: Optional[str] = None


@router.get("/pipelines")
async def list_pipelines(db: Session = Depends(get_session)):
    pipelines = db.exec(
        select(CRMPipeline).where(CRMPipeline.tenant_id == TENANT_ID)
    ).all()
    result = []
    for p in pipelines:
        stages = db.exec(
            select(CRMStage)
            .where(CRMStage.pipeline_id == p.id)
            .order_by(CRMStage.order_index)
        ).all()
        result.append({**p.model_dump(), "stages": [s.model_dump() for s in stages]})
    return result


@router.post("/pipelines")
async def create_pipeline(data: PipelineCreate, db: Session = Depends(get_session)):
    p = CRMPipeline(id=_id("pip"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(p)
    _audit(db, "create", "pipeline", p.id, after=data.model_dump())
    db.commit()
    db.refresh(p)
    return p


@router.post("/pipelines/{pipeline_id}/stages")
async def create_stage(pipeline_id: str, data: StageCreate, db: Session = Depends(get_session)):
    s = CRMStage(id=_id("stg"), tenant_id=TENANT_ID, pipeline_id=pipeline_id, **data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.get("/deals")
async def list_deals(
    pipeline_id: Optional[str] = None,
    stage_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_session),
):
    q = select(CRMDeal).where(CRMDeal.tenant_id == TENANT_ID, CRMDeal.is_deleted == False)
    if pipeline_id:
        q = q.where(CRMDeal.pipeline_id == pipeline_id)
    if stage_id:
        q = q.where(CRMDeal.stage_id == stage_id)
    if status:
        q = q.where(CRMDeal.status == status)
    q = q.order_by(CRMDeal.updated_at.desc()).limit(limit)
    deals = db.exec(q).all()
    # Enrich with stage + contact info
    result = []
    for d in deals:
        deal_data = d.model_dump()
        stage = db.get(CRMStage, d.stage_id)
        if stage:
            deal_data["stage_name"] = stage.name
            deal_data["stage_color"] = stage.color
            deal_data["stage_probability"] = stage.probability
        if d.contact_id:
            contact = db.get(CRMContact, d.contact_id)
            if contact:
                deal_data["contact_name"] = f"{contact.first_name or ''} {contact.last_name or ''}".strip()
                deal_data["contact_email"] = contact.email
        result.append(deal_data)
    return result


@router.post("/deals")
async def create_deal(data: DealCreate, db: Session = Depends(get_session)):
    deal = CRMDeal(id=_id("deal"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(deal)
    _audit(db, "create", "deal", deal.id, after=data.model_dump())
    db.commit()
    db.refresh(deal)
    await emit_event(TENANT_ID, "deal.created", {
        "deal_id": deal.id, "title": deal.title, "value": deal.value,
        "stage_id": deal.stage_id, "contact_id": deal.contact_id,
    })
    return deal


@router.put("/deals/{deal_id}")
async def update_deal(deal_id: str, data: DealUpdate, db: Session = Depends(get_session)):
    d = db.get(CRMDeal, deal_id)
    if not d or d.is_deleted:
        raise HTTPException(404, "Deal not found")
    before = {"title": d.title, "stage_id": d.stage_id, "status": d.status}
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    d.updated_at = datetime.utcnow()
    db.add(d)
    _audit(db, "update", "deal", d.id, before=before, after=data.model_dump(exclude_none=True))
    db.commit()
    db.refresh(d)
    return d


@router.post("/deals/{deal_id}/move-stage")
async def move_deal_stage(deal_id: str, stage_id: str = Query(...), db: Session = Depends(get_session)):
    d = db.get(CRMDeal, deal_id)
    if not d:
        raise HTTPException(404, "Deal not found")
    before_stage = d.stage_id
    d.stage_id = stage_id
    d.updated_at = datetime.utcnow()
    # Check if won/lost stage
    stage = db.get(CRMStage, stage_id)
    if stage and stage.is_won:
        d.status = "won"
        d.closed_at = datetime.utcnow()
    elif stage and stage.is_lost:
        d.status = "lost"
        d.closed_at = datetime.utcnow()
    db.add(d)
    _audit(db, "move_stage", "deal", d.id,
           before={"stage_id": before_stage}, after={"stage_id": stage_id})
    db.commit()
    db.refresh(d)
    await emit_event(TENANT_ID, "deal.updated", {
        "deal_id": d.id, "title": d.title, "stage_id": d.stage_id,
        "previous_stage_id": before_stage, "status": d.status, "value": d.value,
    })
    return d


@router.post("/deals/{deal_id}/close")
async def close_deal(deal_id: str, outcome: str = Query(..., regex="^(won|lost)$"), db: Session = Depends(get_session)):
    d = db.get(CRMDeal, deal_id)
    if not d:
        raise HTTPException(404, "Deal not found")
    d.status = outcome
    d.closed_at = datetime.utcnow()
    d.updated_at = datetime.utcnow()
    db.add(d)
    _audit(db, "close", "deal", d.id, after={"outcome": outcome})
    db.commit()
    db.refresh(d)
    return d


# ─────────────────────────────────────────────
# ACTIVITIES
# ─────────────────────────────────────────────

class ActivityCreate(BaseModel):
    type: str  # call|msg|meeting|task|note|follow_up
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    ticket_id: Optional[str] = None
    channel: Optional[str] = None
    subject: Optional[str] = None
    body: Optional[str] = None
    due_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    priority: str = "medium"


@router.get("/activities")
async def list_activities(
    contact_id: Optional[str] = None,
    deal_id: Optional[str] = None,
    status: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_session),
):
    q = select(CRMActivity).where(CRMActivity.tenant_id == TENANT_ID)
    if contact_id:
        q = q.where(CRMActivity.contact_id == contact_id)
    if deal_id:
        q = q.where(CRMActivity.deal_id == deal_id)
    if status:
        q = q.where(CRMActivity.status == status)
    if type:
        q = q.where(CRMActivity.type == type)
    return db.exec(q.order_by(CRMActivity.created_at.desc()).limit(limit)).all()


@router.post("/activities")
async def create_activity(data: ActivityCreate, db: Session = Depends(get_session)):
    activity = CRMActivity(id=_id("act"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(activity)
    # Update contact last_activity_at
    if data.contact_id:
        contact = db.get(CRMContact, data.contact_id)
        if contact:
            contact.last_activity_at = datetime.utcnow()
            db.add(contact)
    _audit(db, "create", "activity", activity.id, after=data.model_dump(mode="json"))
    db.commit()
    db.refresh(activity)
    return activity


@router.put("/activities/{activity_id}/complete")
async def complete_activity(activity_id: str, db: Session = Depends(get_session)):
    a = db.get(CRMActivity, activity_id)
    if not a:
        raise HTTPException(404, "Activity not found")
    a.status = "completed"
    a.completed_at = datetime.utcnow()
    a.updated_at = datetime.utcnow()
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


# ─────────────────────────────────────────────
# TICKETS
# ─────────────────────────────────────────────

class TicketCreate(BaseModel):
    contact_id: Optional[str] = None
    deal_id: Optional[str] = None
    category: str = "general"
    priority: str = "medium"
    summary: str
    details: Optional[str] = None
    assigned_to: Optional[str] = None


@router.get("/tickets")
async def list_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_session),
):
    q = select(CRMTicket).where(CRMTicket.tenant_id == TENANT_ID)
    if status:
        q = q.where(CRMTicket.status == status)
    if priority:
        q = q.where(CRMTicket.priority == priority)
    return db.exec(q.order_by(CRMTicket.created_at.desc()).limit(limit)).all()


@router.post("/tickets")
async def create_ticket(data: TicketCreate, db: Session = Depends(get_session)):
    ticket = CRMTicket(id=_id("tkt"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(ticket)
    _audit(db, "create", "ticket", ticket.id, after=data.model_dump())
    db.commit()
    db.refresh(ticket)
    await emit_event(TENANT_ID, "ticket.created", {
        "ticket_id": ticket.id, "subject": ticket.subject,
        "priority": ticket.priority, "contact_id": ticket.contact_id,
    })
    return ticket


@router.post("/tickets/{ticket_id}/status")
async def update_ticket_status(ticket_id: str, status: str = Query(...), db: Session = Depends(get_session)):
    t = db.get(CRMTicket, ticket_id)
    if not t:
        raise HTTPException(404, "Ticket not found")
    before = t.status
    t.status = status
    t.updated_at = datetime.utcnow()
    if status == "solved":
        t.resolved_at = datetime.utcnow()
    db.add(t)
    _audit(db, "update", "ticket", t.id, before={"status": before}, after={"status": status})
    db.commit()
    db.refresh(t)
    return t


# ─────────────────────────────────────────────
# SEGMENTS & RFM
# ─────────────────────────────────────────────

class SegmentCreate(BaseModel):
    name: str
    rules_json: dict = {}
    is_dynamic: bool = True


@router.get("/segments")
async def list_segments(db: Session = Depends(get_session)):
    return db.exec(
        select(CRMSegment).where(CRMSegment.tenant_id == TENANT_ID)
    ).all()


@router.post("/segments")
async def create_segment(data: SegmentCreate, db: Session = Depends(get_session)):
    seg = CRMSegment(id=_id("seg"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(seg)
    db.commit()
    db.refresh(seg)
    return seg


@router.post("/segments/{segment_id}/recompute")
async def recompute_segment(segment_id: str, db: Session = Depends(get_session)):
    seg = db.get(CRMSegment, segment_id)
    if not seg:
        raise HTTPException(404, "Segment not found")
    # Simple recompute: count matching contacts based on rules
    contacts = db.exec(
        select(CRMContact).where(
            CRMContact.tenant_id == TENANT_ID,
            CRMContact.is_deleted == False,
        )
    ).all()
    # Apply rules (simplified — in production, parse rules_json DSL)
    rules = seg.rules_json or {}
    matched = contacts
    if "lifecycle_stage" in rules:
        matched = [c for c in matched if c.lifecycle_stage == rules["lifecycle_stage"]]
    if "min_lead_score" in rules:
        matched = [c for c in matched if c.lead_score >= rules["min_lead_score"]]
    if "churn_risk_level" in rules:
        matched = [c for c in matched if c.churn_risk_level == rules["churn_risk_level"]]
    seg.contact_count = len(matched)
    seg.last_computed_at = datetime.utcnow()
    seg.updated_at = datetime.utcnow()
    db.add(seg)
    db.commit()
    db.refresh(seg)
    return {"segment_id": seg.id, "contact_count": seg.contact_count, "sample": [
        {"id": c.id, "name": f"{c.first_name or ''} {c.last_name or ''}".strip(), "email": c.email}
        for c in matched[:5]
    ]}


@router.get("/rfm/summary")
async def rfm_summary(db: Session = Depends(get_session)):
    snapshots = db.exec(
        select(CRMRFMSnapshot).where(CRMRFMSnapshot.tenant_id == TENANT_ID)
    ).all()
    segments = {}
    for s in snapshots:
        label = s.segment_label or "unknown"
        if label not in segments:
            segments[label] = {"count": 0, "avg_monetary": 0, "total_monetary": 0}
        segments[label]["count"] += 1
        segments[label]["total_monetary"] += s.monetary_cents_90d
    for label in segments:
        cnt = segments[label]["count"]
        segments[label]["avg_monetary"] = segments[label]["total_monetary"] / cnt if cnt else 0
    return {"total_contacts": len(snapshots), "segments": segments}


# ─────────────────────────────────────────────
# REPEDIU INTEGRATION
# ─────────────────────────────────────────────

class RepediuConnectRequest(BaseModel):
    api_base_url: str
    api_token: str
    webhook_secret: Optional[str] = ""


@router.post("/integrations/repediu/connect", tags=["repediu"])
async def connect_repediu(data: RepediuConnectRequest, db: Session = Depends(get_session)):
    existing = db.exec(
        select(RepediuConnection).where(RepediuConnection.tenant_id == TENANT_ID)
    ).first()
    if existing:
        existing.api_base_url = data.api_base_url
        existing.api_token_encrypted = data.api_token
        existing.webhook_secret_encrypted = data.webhook_secret or ""
        existing.status = "connected"
        existing.last_health_at = datetime.utcnow()
        existing.updated_at = datetime.utcnow()
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return {"status": "updated", "connection_id": existing.id}

    conn = RepediuConnection(
        id=_id("rep"),
        tenant_id=TENANT_ID,
        api_base_url=data.api_base_url,
        api_token_encrypted=data.api_token,
        webhook_secret_encrypted=data.webhook_secret or "",
        status="connected",
        last_health_at=datetime.utcnow(),
    )
    db.add(conn)
    _audit(db, "create", "repediu_connection", conn.id, after={"api_base_url": data.api_base_url})
    db.commit()
    return {"status": "connected", "connection_id": conn.id}


@router.post("/integrations/repediu/webhook", tags=["repediu"])
async def repediu_webhook(payload: dict, db: Session = Depends(get_session)):
    event_type = payload.get("event_type", "unknown")
    repediu_event_id = payload.get("event_id")
    # Generate idempotency key
    key_source = f"{repediu_event_id or ''}{event_type}{payload.get('external_id', '')}"
    idemp_key = hashlib.sha256(key_source.encode()).hexdigest()[:32]

    # Check idempotency
    existing = db.exec(
        select(IdempotencyRecord).where(
            IdempotencyRecord.tenant_id == TENANT_ID,
            IdempotencyRecord.key == idemp_key,
        )
    ).first()
    if existing:
        return {"status": "duplicate", "message": "Event already processed"}

    # Store webhook event
    evt = RepediuWebhookEvent(
        id=_id("revt"),
        tenant_id=TENANT_ID,
        repediu_event_id=repediu_event_id,
        event_type=event_type,
        idempotency_key=idemp_key,
        payload_json=payload,
        received_at=datetime.utcnow(),
    )
    db.add(evt)

    # Process based on event type
    if event_type == "order.created":
        customer = payload.get("customer", {})
        # Upsert contact
        contact_data = ContactCreate(
            first_name=customer.get("first_name"),
            last_name=customer.get("last_name"),
            phone_e164=customer.get("phone"),
            email=customer.get("email"),
            external_ids_json={"repediu": customer.get("id", "")},
        )
        # Find or create contact (simplified)
        existing_contact = None
        if customer.get("phone"):
            existing_contact = db.exec(
                select(CRMContact).where(
                    CRMContact.tenant_id == TENANT_ID,
                    CRMContact.phone_e164 == customer["phone"],
                )
            ).first()

        if not existing_contact:
            existing_contact = CRMContact(
                id=_id("cnt"), tenant_id=TENANT_ID,
                first_name=customer.get("first_name"),
                last_name=customer.get("last_name"),
                phone_e164=customer.get("phone"),
                email=customer.get("email"),
                external_ids_json={"repediu": customer.get("id", "")},
                lifecycle_stage="customer",
            )
            db.add(existing_contact)

        # Create order
        order = CRMOrder(
            id=_id("ord"),
            tenant_id=TENANT_ID,
            external_order_id=payload.get("order_id"),
            provider="repediu",
            contact_id=existing_contact.id,
            total_cents=int(payload.get("total", 0) * 100),
            items_json=payload.get("items", []),
            channel=payload.get("channel"),
            ordered_at=datetime.utcnow(),
            idempotency_key=idemp_key,
        )
        db.add(order)

        # Update contact
        existing_contact.last_purchase_at = datetime.utcnow()
        existing_contact.last_activity_at = datetime.utcnow()
        db.add(existing_contact)

        # Create activity
        activity = CRMActivity(
            id=_id("act"), tenant_id=TENANT_ID,
            type="note",
            contact_id=existing_contact.id,
            subject=f"Pedido Repediu #{payload.get('order_id', '')}",
            body=f"Novo pedido via Repediu: R$ {payload.get('total', 0):.2f}",
            status="completed",
        )
        db.add(activity)
        evt.status = "processed"
        evt.processed_at = datetime.utcnow()

    elif event_type == "customer.reactivated":
        customer = payload.get("customer", {})
        phone = customer.get("phone")
        if phone:
            contact = db.exec(
                select(CRMContact).where(
                    CRMContact.tenant_id == TENANT_ID,
                    CRMContact.phone_e164 == phone,
                )
            ).first()
            if contact:
                tags = contact.tags_json or []
                if "Reativado" not in tags:
                    tags.append("Reativado")
                    contact.tags_json = tags
                contact.lifecycle_stage = "customer"
                contact.last_activity_at = datetime.utcnow()
                db.add(contact)
        evt.status = "processed"
        evt.processed_at = datetime.utcnow()
    else:
        evt.status = "processed"
        evt.processed_at = datetime.utcnow()

    # Record idempotency
    db.add(IdempotencyRecord(
        id=_id("idm"), tenant_id=TENANT_ID,
        key=idemp_key, entity_type="webhook_event", entity_id=evt.id,
    ))
    db.add(evt)
    db.commit()
    return {"status": "processed", "event_id": evt.id}


@router.get("/integrations/repediu/health", tags=["repediu"])
async def repediu_health(db: Session = Depends(get_session)):
    conn = db.exec(
        select(RepediuConnection).where(RepediuConnection.tenant_id == TENANT_ID)
    ).first()
    if not conn:
        return {"status": "not_connected"}
    recent_events = db.exec(
        select(RepediuWebhookEvent)
        .where(RepediuWebhookEvent.tenant_id == TENANT_ID)
        .order_by(RepediuWebhookEvent.received_at.desc())
        .limit(10)
    ).all()
    return {
        "status": conn.status,
        "last_health_at": conn.last_health_at.isoformat() if conn.last_health_at else None,
        "events_received": conn.events_received,
        "events_failed": conn.events_failed,
        "recent_events": [
            {"id": e.id, "type": e.event_type, "status": e.status, "received_at": e.received_at.isoformat()}
            for e in recent_events
        ],
    }


@router.post("/integrations/repediu/reconcile", tags=["repediu"])
async def repediu_reconcile(db: Session = Depends(get_session)):
    # Count orders by provider
    orders = db.exec(
        select(CRMOrder).where(CRMOrder.tenant_id == TENANT_ID, CRMOrder.provider == "repediu")
    ).all()
    events = db.exec(
        select(RepediuWebhookEvent).where(
            RepediuWebhookEvent.tenant_id == TENANT_ID,
            RepediuWebhookEvent.event_type == "order.created",
            RepediuWebhookEvent.status == "processed",
        )
    ).all()
    return {
        "orders_count": len(orders),
        "events_processed": len(events),
        "divergence": abs(len(orders) - len(events)),
        "status": "ok" if len(orders) == len(events) else "divergence_detected",
    }


# ─────────────────────────────────────────────
# CENTRAL AI CONFIG
# ─────────────────────────────────────────────

class AICenterUpdate(BaseModel):
    name: Optional[str] = None
    default_persona_id: Optional[str] = None
    default_voice_id: Optional[str] = None
    autonomy_default: Optional[str] = None
    allowed_tools_json: Optional[list] = None
    settings_json: Optional[dict] = None


@router.get("/settings/ai-center", tags=["ai-center"])
async def get_ai_center(db: Session = Depends(get_session)):
    center = db.exec(
        select(AICenter).where(AICenter.tenant_id == TENANT_ID)
    ).first()
    if not center:
        center = AICenter(id=_id("aic"), tenant_id=TENANT_ID)
        db.add(center)
        db.commit()
        db.refresh(center)
    # Enrich with persona/voice/knowledge
    personas = db.exec(
        select(PersonaProfile).where(PersonaProfile.tenant_id == TENANT_ID)
    ).all()
    voices = db.exec(
        select(VoiceProfile).where(VoiceProfile.tenant_id == TENANT_ID)
    ).all()
    knowledge_packs = db.exec(
        select(KnowledgePack).where(KnowledgePack.tenant_id == TENANT_ID)
    ).all()
    return {
        **center.model_dump(),
        "personas": [p.model_dump() for p in personas],
        "voices": [v.model_dump() for v in voices],
        "knowledge_packs": [k.model_dump() for k in knowledge_packs],
    }


@router.put("/settings/ai-center", tags=["ai-center"])
async def update_ai_center(data: AICenterUpdate, db: Session = Depends(get_session)):
    center = db.exec(
        select(AICenter).where(AICenter.tenant_id == TENANT_ID)
    ).first()
    if not center:
        center = AICenter(id=_id("aic"), tenant_id=TENANT_ID)
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(center, k, v)
    center.updated_at = datetime.utcnow()
    db.add(center)
    _audit(db, "update", "ai_center", center.id, after=data.model_dump(exclude_none=True))
    db.commit()
    db.refresh(center)
    return center


# ─────────────────────────────────────────────
# AUTONOMY POLICIES
# ─────────────────────────────────────────────

@router.get("/settings/autonomy", tags=["ai-center"])
async def list_autonomy_policies(db: Session = Depends(get_session)):
    return db.exec(
        select(AutonomyPolicy).where(AutonomyPolicy.tenant_id == TENANT_ID)
    ).all()


class AutonomyPolicyUpdate(BaseModel):
    mode: str  # auto | semi | manual
    conditions_json: Optional[dict] = None


@router.put("/settings/autonomy/{policy_id}", tags=["ai-center"])
async def update_autonomy_policy(
    policy_id: str, data: AutonomyPolicyUpdate, db: Session = Depends(get_session)
):
    policy = db.get(AutonomyPolicy, policy_id)
    if not policy or policy.tenant_id != TENANT_ID:
        raise HTTPException(status_code=404, detail="Policy not found")
    before = {"mode": policy.mode, "conditions_json": policy.conditions_json}
    policy.mode = data.mode
    if data.conditions_json is not None:
        policy.conditions_json = data.conditions_json
    db.add(policy)
    _audit(db, "update", "autonomy_policy", policy.id, before=before, after=data.model_dump(exclude_none=True))
    db.commit()
    db.refresh(policy)
    return policy


# ─────────────────────────────────────────────
# COST BUDGETS
# ─────────────────────────────────────────────

@router.get("/settings/budgets", tags=["ai-center"])
async def list_cost_budgets(db: Session = Depends(get_session)):
    return db.exec(
        select(CostBudget).where(CostBudget.tenant_id == TENANT_ID)
    ).all()


class CostBudgetUpdate(BaseModel):
    monthly_limit_usd: Optional[float] = None
    current_spend_usd: Optional[float] = None


@router.put("/settings/budgets/{budget_id}", tags=["ai-center"])
async def update_cost_budget(
    budget_id: str, data: CostBudgetUpdate, db: Session = Depends(get_session)
):
    budget = db.get(CostBudget, budget_id)
    if not budget or budget.tenant_id != TENANT_ID:
        raise HTTPException(status_code=404, detail="Budget not found")
    before = {"monthly_limit_usd": budget.monthly_limit_usd, "current_spend_usd": budget.current_spend_usd}
    if data.monthly_limit_usd is not None:
        budget.monthly_limit_usd = data.monthly_limit_usd
    if data.current_spend_usd is not None:
        budget.current_spend_usd = data.current_spend_usd
    db.add(budget)
    _audit(db, "update", "cost_budget", budget.id, before=before, after=data.model_dump(exclude_none=True))
    db.commit()
    db.refresh(budget)
    return budget


# ─────────────────────────────────────────────
# CAMPAIGNS
# ─────────────────────────────────────────────

class CampaignCreate(BaseModel):
    name: str
    type: str = "sequence"
    channel: str = "whatsapp"
    segment_id: Optional[str] = None
    template_json: dict = {}
    schedule_json: dict = {}
    n8n_workflow_key: Optional[str] = None


@router.get("/campaigns")
async def list_campaigns(db: Session = Depends(get_session)):
    return db.exec(
        select(CRMCampaign).where(CRMCampaign.tenant_id == TENANT_ID)
        .order_by(CRMCampaign.created_at.desc())
    ).all()


@router.post("/campaigns")
async def create_campaign(data: CampaignCreate, db: Session = Depends(get_session)):
    campaign = CRMCampaign(id=_id("cmp"), tenant_id=TENANT_ID, **data.model_dump())
    db.add(campaign)
    _audit(db, "create", "campaign", campaign.id, after=data.model_dump())
    db.commit()
    db.refresh(campaign)
    return campaign


@router.post("/campaigns/{campaign_id}/activate")
async def activate_campaign(campaign_id: str, db: Session = Depends(get_session)):
    c = db.get(CRMCampaign, campaign_id)
    if not c:
        raise HTTPException(404, "Campaign not found")
    c.status = "active"
    c.updated_at = datetime.utcnow()
    db.add(c)
    _audit(db, "send_campaign", "campaign", c.id, after={"status": "active"})
    db.commit()
    await emit_event(TENANT_ID, "campaign.activated", {
        "campaign_id": c.id, "name": c.name, "channel": c.channel, "type": c.type,
    })
    return c


@router.post("/campaigns/{campaign_id}/pause")
async def pause_campaign(campaign_id: str, db: Session = Depends(get_session)):
    c = db.get(CRMCampaign, campaign_id)
    if not c:
        raise HTTPException(404, "Campaign not found")
    c.status = "paused"
    c.updated_at = datetime.utcnow()
    db.add(c)
    db.commit()
    return c


# ─────────────────────────────────────────────
# N8N GATEWAY
# ─────────────────────────────────────────────

class N8NDispatchRequest(BaseModel):
    workflow_key: str
    payload: dict = {}
    idempotency_key: Optional[str] = None


N8N_WEBHOOK_BASE = os.getenv("N8N_WEBHOOK_URL", "http://localhost:5678/webhook")


@router.post("/n8n/dispatch", tags=["n8n"])
async def dispatch_n8n(data: N8NDispatchRequest, db: Session = Depends(get_session)):
    if data.idempotency_key:
        existing = db.exec(
            select(N8NDispatch).where(
                N8NDispatch.tenant_id == TENANT_ID,
                N8NDispatch.idempotency_key == data.idempotency_key,
            )
        ).first()
        if existing:
            return {"status": "duplicate", "dispatch_id": existing.id}

    dispatch = N8NDispatch(
        id=_id("n8n"),
        tenant_id=TENANT_ID,
        workflow_key=data.workflow_key,
        payload_json=data.payload,
        idempotency_key=data.idempotency_key,
        status="pending",
    )
    db.add(dispatch)
    db.commit()
    db.refresh(dispatch)

    # Fire real HTTP POST to n8n webhook
    import httpx
    target_url = f"{N8N_WEBHOOK_BASE}/{data.workflow_key}"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(target_url, json={
                "dispatch_id": dispatch.id,
                "workflow_key": data.workflow_key,
                "tenant_id": TENANT_ID,
                **data.payload,
            })
        dispatch.status = "dispatched"
        dispatch.response_json = {"status_code": resp.status_code, "body": resp.text[:500]}
    except Exception as e:
        dispatch.status = "failed"
        dispatch.response_json = {"error": str(e)[:500]}
        dispatch.retries += 1

    db.add(dispatch)
    db.commit()
    return {"status": dispatch.status, "dispatch_id": dispatch.id}


@router.get("/n8n/health", tags=["n8n"])
async def n8n_health():
    return {"status": "ok", "message": "n8n gateway operational"}


# ─────────────────────────────────────────────
# AUDIT EXPLORER
# ─────────────────────────────────────────────

@router.get("/audit")
async def list_audit_logs(
    entity_type: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_session),
):
    q = select(CRMAuditLog).where(CRMAuditLog.tenant_id == TENANT_ID)
    if entity_type:
        q = q.where(CRMAuditLog.entity_type == entity_type)
    if action:
        q = q.where(CRMAuditLog.action == action)
    return db.exec(q.order_by(CRMAuditLog.created_at.desc()).limit(limit)).all()


# ─────────────────────────────────────────────
# DASHBOARD KPIs
# ─────────────────────────────────────────────

@router.get("/dashboard")
async def crm_dashboard(db: Session = Depends(get_session)):
    contacts = db.exec(
        select(CRMContact).where(CRMContact.tenant_id == TENANT_ID, CRMContact.is_deleted == False)
    ).all()
    deals = db.exec(
        select(CRMDeal).where(CRMDeal.tenant_id == TENANT_ID, CRMDeal.is_deleted == False)
    ).all()
    tickets = db.exec(
        select(CRMTicket).where(CRMTicket.tenant_id == TENANT_ID)
    ).all()
    activities = db.exec(
        select(CRMActivity).where(CRMActivity.tenant_id == TENANT_ID, CRMActivity.status == "pending")
    ).all()

    # KPIs
    new_leads = len([c for c in contacts if c.lifecycle_stage == "lead"])
    customers = len([c for c in contacts if c.lifecycle_stage == "customer"])
    churn_risk = len([c for c in contacts if c.churn_risk_level in ("high", "medium")])
    open_deals = len([d for d in deals if d.status == "open"])
    won_deals = len([d for d in deals if d.status == "won"])
    lost_deals = len([d for d in deals if d.status == "lost"])
    pipeline_value = sum((d.value_cents or 0) for d in deals if d.status == "open")
    open_tickets = len([t for t in tickets if t.status in ("open", "pending")])
    sla_at_risk = len([t for t in tickets if t.sla_due_at and t.sla_due_at < datetime.utcnow() and t.status in ("open", "pending")])
    pending_tasks = len(activities)

    # Conversion by stage
    pipelines = db.exec(select(CRMPipeline).where(CRMPipeline.tenant_id == TENANT_ID)).all()
    stages_data = []
    for p in pipelines:
        stages = db.exec(
            select(CRMStage).where(CRMStage.pipeline_id == p.id).order_by(CRMStage.order_index)
        ).all()
        for s in stages:
            count = len([d for d in deals if d.stage_id == s.id])
            value = sum((d.value_cents or 0) for d in deals if d.stage_id == s.id)
            stages_data.append({
                "pipeline": p.name, "stage": s.name, "color": s.color,
                "count": count, "value_cents": value, "order": s.order_index,
            })

    return {
        "contacts_total": len(contacts),
        "new_leads": new_leads,
        "customers": customers,
        "churn_risk": churn_risk,
        "open_deals": open_deals,
        "won_deals": won_deals,
        "lost_deals": lost_deals,
        "pipeline_value_cents": pipeline_value,
        "open_tickets": open_tickets,
        "sla_at_risk": sla_at_risk,
        "pending_tasks": pending_tasks,
        "stages": stages_data,
    }


# ─────────────────────────────────────────────
# ORDERS (read-only for CRM)
# ─────────────────────────────────────────────

@router.get("/orders")
async def list_orders(
    contact_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_session),
):
    q = select(CRMOrder).where(CRMOrder.tenant_id == TENANT_ID)
    if contact_id:
        q = q.where(CRMOrder.contact_id == contact_id)
    return db.exec(q.order_by(CRMOrder.ordered_at.desc()).limit(limit)).all()
