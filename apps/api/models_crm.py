"""
Pulse CRM — Data Model
Enterprise CRM tables with multi-tenant, RBAC, idempotency, and audit support.
All tables use tenant_id for isolation. Existing models.py tables (Contact, Deal, etc.)
remain for legacy/omnichannel features; these CRM tables power the new CRM 360 module.
"""
from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON, Text, BigInteger


# ─────────────────────────────────────────────
# 1. CRM CORE — Contacts & Companies
# ─────────────────────────────────────────────

class CRMContact(SQLModel, table=True):
    __tablename__ = "crm_contacts"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    external_ids_json: dict = Field(default={}, sa_column=Column(JSON))  # {repediu: "x", hubspot: "y"}
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_e164: Optional[str] = Field(default=None, index=True)
    email: Optional[str] = Field(default=None, index=True)
    document_id: Optional[str] = None  # CPF, CNPJ, etc.
    consent_json: dict = Field(default={}, sa_column=Column(JSON))  # {whatsapp: true, email: true}
    preferences_json: dict = Field(default={}, sa_column=Column(JSON))
    tags_json: list = Field(default=[], sa_column=Column(JSON))
    lead_score: int = 0  # 0-100
    lifecycle_stage: str = "lead"  # lead|prospect|customer|churn_risk|churned
    health_score: float = 100.0
    predicted_ltv: float = 0.0
    churn_risk_level: str = "low"
    last_activity_at: Optional[datetime] = None
    last_purchase_at: Optional[datetime] = None
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CRMCompany(SQLModel, table=True):
    __tablename__ = "crm_companies"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    name: str
    domain: Optional[str] = None
    document_id: Optional[str] = None  # CNPJ
    external_ids_json: dict = Field(default={}, sa_column=Column(JSON))
    tags_json: list = Field(default=[], sa_column=Column(JSON))
    health_score: float = 100.0
    notes: Optional[str] = None
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CRMContactCompany(SQLModel, table=True):
    __tablename__ = "crm_contact_company"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    contact_id: str = Field(index=True)
    company_id: str = Field(index=True)
    role_title: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 2. PIPELINE — Deals & Stages
# ─────────────────────────────────────────────

class CRMPipeline(SQLModel, table=True):
    __tablename__ = "crm_pipelines"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    name: str
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CRMStage(SQLModel, table=True):
    __tablename__ = "crm_stages"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    pipeline_id: str = Field(index=True)
    name: str
    order_index: int = 0
    sla_hours: Optional[int] = None
    probability: Optional[float] = None  # 0.0 to 1.0
    is_won: bool = False
    is_lost: bool = False
    color: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CRMDeal(SQLModel, table=True):
    __tablename__ = "crm_deals"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    pipeline_id: str = Field(index=True)
    stage_id: str = Field(index=True)
    contact_id: Optional[str] = Field(default=None, index=True)
    company_id: Optional[str] = Field(default=None, index=True)
    title: str
    value_cents: Optional[int] = None
    currency: str = "BRL"
    source: Optional[str] = None  # inbox, campaign, repediu, manual
    lead_score: int = 0
    status: str = "open"  # open|won|lost
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    is_deleted: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 3. ACTIVITIES — Tasks, Notes, Meetings
# ─────────────────────────────────────────────

class CRMActivity(SQLModel, table=True):
    __tablename__ = "crm_activities"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    type: str  # call|msg|meeting|task|note|follow_up
    contact_id: Optional[str] = Field(default=None, index=True)
    deal_id: Optional[str] = Field(default=None, index=True)
    ticket_id: Optional[str] = Field(default=None, index=True)
    channel: Optional[str] = None  # whatsapp|email|sms|ig|phone
    subject: Optional[str] = None
    body: Optional[str] = Field(default=None, sa_column=Column(Text))
    due_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    assigned_to: Optional[str] = None  # user_id
    status: str = "pending"  # pending|in_progress|completed|cancelled
    priority: str = "medium"  # low|medium|high|urgent
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 4. TICKETS (CRM-native, extends existing)
# ─────────────────────────────────────────────

class CRMTicket(SQLModel, table=True):
    __tablename__ = "crm_tickets"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    contact_id: Optional[str] = Field(default=None, index=True)
    deal_id: Optional[str] = Field(default=None, index=True)
    category: str = "general"
    priority: str = "medium"  # low|medium|high|urgent
    status: str = "open"  # open|pending|solved|closed
    sla_due_at: Optional[datetime] = None
    summary: str
    details: Optional[str] = Field(default=None, sa_column=Column(Text))
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None
    nps_score: Optional[int] = None  # 0-10
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 5. ORDERS (Delivery / Repediu)
# ─────────────────────────────────────────────

class CRMOrder(SQLModel, table=True):
    __tablename__ = "crm_orders"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    external_order_id: Optional[str] = Field(default=None, index=True)
    provider: str = "manual"  # repediu|manual|shopify
    contact_id: str = Field(index=True)
    total_cents: int = 0
    currency: str = "BRL"
    items_json: list = Field(default=[], sa_column=Column(JSON))
    channel: Optional[str] = None
    ordered_at: datetime = Field(default_factory=datetime.utcnow)
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    idempotency_key: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 6. SEGMENTATION & RFM
# ─────────────────────────────────────────────

class CRMSegment(SQLModel, table=True):
    __tablename__ = "crm_segments"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    name: str
    rules_json: dict = Field(default={}, sa_column=Column(JSON))  # DSL filters
    is_dynamic: bool = True
    contact_count: int = 0
    last_computed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CRMRFMSnapshot(SQLModel, table=True):
    __tablename__ = "crm_rfm_snapshots"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    contact_id: str = Field(index=True)
    recency_days: int = 0
    frequency_count_90d: int = 0
    monetary_cents_90d: int = 0
    score_json: dict = Field(default={}, sa_column=Column(JSON))  # {r: 5, f: 3, m: 4}
    segment_label: Optional[str] = None  # champion|loyal|at_risk|lost
    calculated_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 7. REPEDIU INTEGRATION
# ─────────────────────────────────────────────

class RepediuConnection(SQLModel, table=True):
    __tablename__ = "repediu_connections"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    api_base_url: str = ""
    api_token_encrypted: str = ""
    webhook_secret_encrypted: str = ""
    status: str = "disconnected"  # connected|disconnected|error
    last_health_at: Optional[datetime] = None
    events_received: int = 0
    events_failed: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class RepediuWebhookEvent(SQLModel, table=True):
    __tablename__ = "repediu_webhook_events"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    repediu_event_id: Optional[str] = None
    event_type: str  # order.created, customer.updated, customer.reactivated
    idempotency_key: str = Field(index=True)
    payload_json: dict = Field(default={}, sa_column=Column(JSON))
    received_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    status: str = "pending"  # pending|processed|failed|duplicate
    error_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    retry_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 8. CENTRAL AI CONFIG
# ─────────────────────────────────────────────

class AICenter(SQLModel, table=True):
    __tablename__ = "ai_centers"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    name: str = "Jarvis"  # Customizable AI name
    default_persona_id: Optional[str] = None
    default_voice_id: Optional[str] = None
    autonomy_default: str = "semi"  # auto|semi|manual
    allowed_tools_json: list = Field(default=[], sa_column=Column(JSON))
    settings_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 9. RBAC — Granular Permissions
# ─────────────────────────────────────────────

class CRMRole(SQLModel, table=True):
    __tablename__ = "crm_roles"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    name: str  # admin|manager|sales|support|viewer
    permissions_json: list = Field(default=[], sa_column=Column(JSON))
    # e.g. ["crm.contacts.read","crm.contacts.write","crm.deals.move","crm.campaigns.send"]
    is_system: bool = False  # System roles can't be deleted
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CRMMembership(SQLModel, table=True):
    __tablename__ = "crm_memberships"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    user_id: str = Field(index=True)
    role_id: str = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 10. AUDIT — Immutable Log
# ─────────────────────────────────────────────

class CRMAuditLog(SQLModel, table=True):
    __tablename__ = "crm_audit_logs"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    actor_type: str  # user|system|agent|integration
    actor_id: str
    action: str  # create|update|delete|move_stage|send_campaign|merge|import
    entity_type: str  # contact|deal|ticket|order|campaign|segment
    entity_id: str
    before_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    after_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    ip_address: Optional[str] = None
    irreversible: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 11. AUTONOMY & COST POLICIES
# ─────────────────────────────────────────────

class AutonomyPolicy(SQLModel, table=True):
    __tablename__ = "autonomy_policies"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    scope: str  # inbox_reply|deal_move|campaign_send|ticket_resolve
    mode: str = "semi"  # auto|semi|manual
    conditions_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CostBudget(SQLModel, table=True):
    __tablename__ = "cost_budgets"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    category: str  # ai|campaigns|integrations
    monthly_limit_usd: float = 100.0
    current_spend_usd: float = 0.0
    alert_threshold_pct: float = 0.8  # Alert at 80%
    is_hard_limit: bool = False  # Block at limit vs just alert
    period: str = ""  # YYYY-MM
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 12. CAMPAIGNS & SEQUENCES
# ─────────────────────────────────────────────

class CRMCampaign(SQLModel, table=True):
    __tablename__ = "crm_campaigns"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    name: str
    type: str = "sequence"  # sequence|broadcast|drip
    channel: str = "whatsapp"  # whatsapp|sms|email|push
    segment_id: Optional[str] = None
    template_json: dict = Field(default={}, sa_column=Column(JSON))
    schedule_json: dict = Field(default={}, sa_column=Column(JSON))  # timer presets
    status: str = "draft"  # draft|active|paused|completed
    sent_count: int = 0
    opened_count: int = 0
    clicked_count: int = 0
    replied_count: int = 0
    n8n_workflow_key: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CRMCampaignEvent(SQLModel, table=True):
    __tablename__ = "crm_campaign_events"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    campaign_id: str = Field(index=True)
    contact_id: str = Field(index=True)
    event_type: str  # sent|delivered|opened|clicked|replied|bounced|unsubscribed
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 13. IDEMPOTENCY STORE
# ─────────────────────────────────────────────

class IdempotencyRecord(SQLModel, table=True):
    __tablename__ = "idempotency_records"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    key: str = Field(index=True)  # Hash of event
    entity_type: str  # order|contact|webhook_event
    entity_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─────────────────────────────────────────────
# 14. N8N GATEWAY
# ─────────────────────────────────────────────

class N8NDispatch(SQLModel, table=True):
    __tablename__ = "n8n_dispatches"
    id: str = Field(primary_key=True)
    tenant_id: str = Field(index=True)
    workflow_key: str  # campaign_whatsapp, report_pdf, etc.
    payload_json: dict = Field(default={}, sa_column=Column(JSON))
    idempotency_key: Optional[str] = Field(default=None, index=True)
    status: str = "pending"  # pending|dispatched|completed|failed
    response_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    retries: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
