from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime, JSON

class Tenant(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    slug: str = Field(unique=True, index=True)
    primary_color: str = "#0066FF"
    logo_url: Optional[str] = None
    custom_domain: Optional[str] = None
    ai_persona_config: dict = Field(default={"name": "Jarvis", "avatar": None}, sa_column=Column(JSON))
    # Insights Fields
    health_score: Optional[float] = 100.0 # 0-100 score de saúde do tenant
    growth_projections_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class User(SQLModel, table=True):
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    full_name: Optional[str] = None
    is_active: bool = True
    mfa_enabled: bool = False
    mfa_secret: Optional[str] = None
    sso_provider: Optional[str] = None # google, azure, saml
    sso_id: Optional[str] = None
    privacy_consents: Optional[str] = "{}" # JSON string de consentimentos
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Role(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    tenant_id: str = Field(foreign_key="tenant.id")

class Permission(SQLModel, table=True):
    id: str = Field(primary_key=True)
    key: str

class Membership(SQLModel, table=True):
    user_id: str = Field(foreign_key="user.id", primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", primary_key=True)
    role_id: str = Field(foreign_key="role.id")

class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    actor_type: str  # user, system, agent
    actor_id: str
    action: str
    entity_type: str
    entity_id: str
    before_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    after_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    reasoning_summary: Optional[str] = None
    policy_applied: Optional[str] = None
    risk_score: Optional[float] = 0.0
    irreversible: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Channel(SQLModel, table=True):
    id: str = Field(primary_key=True)
    type: str  # instagram, facebook, whatsapp, email...
    name: str

class ChannelAccount(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    channel_id: str = Field(foreign_key="channel.id")
    external_account_id: str
    auth_blob_encrypted: str
    status: str = "active"
    health_metrics: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Contact(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    external_ids_json: dict = Field(default={}, sa_column=Column(JSON))
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    tags_json: List[str] = Field(default=[], sa_column=Column(JSON))
    # Insights Fields
    health_score: Optional[float] = 100.0 # Probabilidade de permanência
    predicted_ltv: Optional[float] = 0.0
    churn_risk_level: str = "low" # low, medium, high
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Conversation(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    channel_account_id: str = Field(foreign_key="channelaccount.id")
    contact_id: str = Field(foreign_key="contact.id")
    external_thread_id: str
    status: str = "open" # open, pending, closed
    priority: str = "medium" # low, medium, high, urgent
    intent: Optional[str] = None
    sla_due_at: Optional[datetime] = None
    assigned_to_user_id: Optional[str] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Message(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    external_message_id: str
    direction: str  # inbound, outbound
    sender_type: str # contact, user, agent, system
    content: str
    attachments_json: List[dict] = Field(default=[], sa_column=Column(JSON))
    sentiment_score: Optional[float] = None
    # Perception Fields
    visual_summary_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    ocr_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContentAsset(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    type: str  # post, script, caption, image
    title: str
    body: str
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    qa_status: str = "pending" # pending, approved, rejected
    risk_score: float = 0.0
    # Perception Fields
    visual_labels_json: List[str] = Field(default=[], sa_column=Column(JSON))
    ocr_content: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Campaign(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    goal: str
    budget: Optional[float] = None
    status: str = "draft" # draft, active, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CalendarItem(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    channel_account_id: str = Field(foreign_key="channelaccount.id")
    content_asset_id: str = Field(foreign_key="contentasset.id")
    scheduled_at: datetime
    status: str = "scheduled" # scheduled, published, failed
    approval_mode: str = "manual" # auto, semi, manual
    approved_by: Optional[str] = Field(default=None, foreign_key="user.id")
    publish_job_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ModerationPolicy(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    mode: str = "semi" # auto, semi, manual
    rules_json: dict = Field(default={}, sa_column=Column(JSON))
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ModerationEvent(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    channel_account_id: str = Field(foreign_key="channelaccount.id")
    external_object_id: str
    object_type: str # message, comment, post
    classification: str # spam, hate, safe
    action_taken: str # hidden, deleted, none
    reversible: bool = True
    undo_payload_json: dict = Field(default={}, sa_column=Column(JSON))
    risk_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Integration(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    provider: str # hubspot, salesforce, google_ads
    type: str # crm, ads, automation
    status: str = "connected"
    config_json_encrypted: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CustomConnector(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    auth_type: str # oauth2, apikey
    config_json_encrypted: str
    version: str = "v1"
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ConnectorMapping(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    connector_id: str = Field(foreign_key="customconnector.id")
    entity_type: str # Lead, Contact, Deal
    mapping_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)



class Webhook(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    connector_id: Optional[str] = Field(default=None, foreign_key="customconnector.id")
    url: str
    secret_hash: str
    events_json: List[str] = Field(default=[], sa_column=Column(JSON))
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Playbook(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    description: Optional[str] = None
    department: str # sales, support, security, marketing
    rules_json: dict = Field(default={}, sa_column=Column(JSON))
    tone_of_voice: str = "professional"
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Agent(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    playbook_id: str = Field(foreign_key="playbook.id")
    name: str
    avatar_url: Optional[str] = None
    role: str # support_lead, growth_hacker, security_officer
    status: str = "idle" # idle, thinking, acting, paused
    intelligence_level: str = "high" # standard, high, genius
    capabilities_json: List[str] = Field(default=[], sa_column=Column(JSON))
    llm_node_id: str = "pulse-central-v1"
    # AI Team Fields
    skills_json: List[str] = Field(default=[], sa_column=Column(JSON)) # Ex: ["crm_access", "billing_read", "ticket_resolve"]
    memory_context_id: Optional[str] = None # ID para partição de memória RAG
    handoff_rules_json: dict = Field(default={}, sa_column=Column(JSON)) # Regras de para quem transferir
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentCollaboration(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    source_agent_id: str = Field(foreign_key="agent.id")
    target_agent_id: str = Field(foreign_key="agent.id")
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    reason: str # Motivo do handoff ou colaboração
    context_passed_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AgentTask(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    agent_id: str = Field(foreign_key="agent.id")
    type: str # reply_inbox, schedule_post, analyze_sentiment
    priority: int = 1
    status: str = "pending" # pending, in_progress, completed, failed
    input_payload: dict = Field(default={}, sa_column=Column(JSON))
    output_result: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SubscriptionPlan(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str # Free, Starter, Pro, Enterprise
    price_monthly: float
    price_yearly: float
    features_json: dict = Field(default={}, sa_column=Column(JSON))
    max_tenants: int = 1
    max_agents: int = 2
    max_messages_monthly: int = 1000
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UsageQuota(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    plan_id: str = Field(foreign_key="subscriptionplan.id")
    current_period_start: datetime
    current_period_end: datetime
    messages_sent: int = 0
    ai_credits_remaining: float = 0.0
    status: str = "active" # active, past_due, canceled
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreditTransaction(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    amount: float
    type: str # purchase, usage, refund
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class APIKey(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    key_hash: str = Field(index=True)
    name: str # Ex: "Zapier Integration"
    scopes: str = "read,write" # comma separated
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Workflow(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    description: Optional[str] = None
    trigger_type: str # message_received, email_received, lead_created
    config: str = "{}" # JSON string para configurações globais
    # Canvas Fields
    viewport_json: Optional[dict] = Field(default=None, sa_column=Column(JSON)) # Posição/Zoom do Canvas
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WorkflowStep(SQLModel, table=True):
    id: str = Field(primary_key=True)
    workflow_id: str = Field(foreign_key="workflow.id", index=True)
    type: str # action, condition, delay
    action_type: str # send_message, notify_slack, jarvis_analyze
    config: str = "{}" # JSON string com parâmetros da ação
    # Visual Canvas Fields
    position_x: float = 0
    position_y: float = 0
    node_type: str = "default" # trigger, action, ai_brain, logic
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None
    ui_metadata_json: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    next_step_id: Optional[str] = None

class WorkflowRun(SQLModel, table=True):
    id: str = Field(primary_key=True)
    workflow_id: str = Field(foreign_key="workflow.id", index=True)
    status: str # pending, running, completed, failed
    logs: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PipelineStage(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # Ex: "Prospecção", "Qualificação", "Fechado"
    order: int = 0
    color: Optional[str] = None # HEX color para UI

class Deal(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    title: str
    value: float = 0.0
    currency: str = "BRL"
    status: str = "open" # open, won, lost
    lead_score: Optional[int] = None # 0-100 (atribuído pela IA)
    stage_id: str = Field(foreign_key="pipelinestage.id", index=True)
    source: Optional[str] = None # whatsapp, email, api
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Ticket(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    subject: str
    description: str
    status: str = "new" # new, open, pending, solved, closed
    priority: str = "medium" # low, medium, high, urgent
    user_id: Optional[str] = Field(foreign_key="user.id", index=True) # Atribuído a
    customer_id: Optional[str] = None # Vínculo com contato/lead
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    due_at: Optional[datetime] = None # SLA deadline

class SLAPolicy(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    priority: str # low, medium, high, urgent
    response_time_hours: int
    resolution_time_hours: int

class KBArticle(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    title: str
    content: str
    category: str
    is_published: bool = False
    author_id: str = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class App(SQLModel, table=True):
    id: str = Field(primary_key=True)
    name: str
    description: str
    icon_url: Optional[str] = None
    developer_name: str
    category: str # CRM, AI, Automation, Support
    required_scopes: str = "[]" # JSON string de scopes (ex: ["read:messages", "write:deals"])
    is_official: bool = False
    is_public: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AppInstallation(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    app_id: str = Field(foreign_key="app.id", index=True)
    installed_by_id: str = Field(foreign_key="user.id")
    config: str = "{}" # Configurações específicas da instalação (JSON)
    is_enabled: bool = True
    installed_at: datetime = Field(default_factory=datetime.utcnow)

class CallRecord(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    from_number: str
    to_number: str
    direction: str # inbound, outbound
    duration_seconds: int = 0
    status: str # completed, missed, busy, failed
    recording_url: Optional[str] = None
    transcription: Optional[str] = None
    summary: Optional[str] = None # TL;DR gerado pelo Jarvis
    sentiment_score: Optional[float] = None # -1.0 to 1.0 (Análise IA)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Voicemail(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    call_record_id: str = Field(foreign_key="callrecord.id", index=True)
    audio_url: str
    transcription: Optional[str] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ForumTopic(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    author_id: str = Field(foreign_key="user.id")
    title: str
    content: str
    category: str # General, Q&A, Announcements
    is_pinned: bool = False
    is_locked: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ForumPost(SQLModel, table=True):
    id: str = Field(primary_key=True)
    topic_id: str = Field(foreign_key="forumtopic.id", index=True)
    author_id: str = Field(foreign_key="user.id")
    content: str
    is_solution: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class FeatureRequest(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    author_id: str = Field(foreign_key="user.id")
    title: str
    description: str
    status: str = "open" # open, under_review, planned, in_progress, completed, declined
    votes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserBadge(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    name: str # Contributor, Problem Solver, Beta Tester
    icon: str
    awarded_at: datetime = Field(default_factory=datetime.utcnow)

class Product(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    description: Optional[str] = None
    price: float
    currency: str = "BRL"
    sku: Optional[str] = None
    image_url: Optional[str] = None
    stock_quantity: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Order(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    contact_id: str = Field(foreign_key="contact.id", index=True)
    conversation_id: Optional[str] = Field(foreign_key="conversation.id", index=True)
    status: str = "draft" # draft, pending_payment, paid, shipped, canceled
    total_amount: float = 0.0
    payment_link_url: Optional[str] = None
    external_order_id: Optional[str] = None # ID no Stripe/Hubspot
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class OrderItem(SQLModel, table=True):
    id: str = Field(primary_key=True)
    order_id: str = Field(foreign_key="order.id", index=True)
    product_id: str = Field(foreign_key="product.id")
    quantity: int = 1
    unit_price: float

class PaymentTransaction(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    order_id: str = Field(foreign_key="order.id", index=True)
    provider: str # stripe, stone, pix
    amount: float
    status: str # pending, succeeded, failed, refunded
    provider_tx_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BusinessForecast(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    type: str # revenue, churn, growth
    period_start: datetime
    period_end: datetime
    predicted_value: float
    confidence_score: float # 0.0 to 1.0
    actual_value: Optional[float] = None # Para retroalimentação da IA
    insights_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SecurityAlert(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    type: str # brute_force, anomalous_access, data_leak_attempt, fraud_suspect
    severity: str # low, medium, high, critical
    status: str = "open" # open, investigating, resolved, false_positive
    description: str
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditSession(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    ip_address: str
    user_agent: str
    activity_log_json: List[dict] = Field(default=[], sa_column=Column(JSON))
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None

class DLPPolicy(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # ex: "Mask Credit Cards"
    pattern_type: str # regex, ai_entity (cpf, credit_card, phone)
    action: str # mask, block, alert
    is_enabled: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UIState(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    context_key: str # ex: "inbox_sidebar", "dashboard_main"
    layout_json: dict = Field(default={}, sa_column=Column(JSON))
    widgets_json: List[dict] = Field(default=[], sa_column=Column(JSON))
    theme_overrides_json: dict = Field(default={}, sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WidgetConfig(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # ex: "Main Website Chat"
    # Branding
    primary_color: str = "#7C3AED"
    accent_color: str = "#10B981"
    logo_url: Optional[str] = None
    welcome_message: str = "Olá! Como posso ajudar você hoje?"
    # Behavior
    agent_id: Optional[str] = Field(default=None, foreign_key="agent.id")
    is_active: bool = True
    # Security
    allowed_domains_json: List[str] = Field(default=[], sa_column=Column(JSON)) # Whitelist de domínios
    # Tracking
    collect_email: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeSource(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # ex: "Manual de Reembolso v2"
    source_type: str # file, url, integration, text
    content_url: Optional[str] = None
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    status: str = "pending" # pending, indexing, active, error
    last_synced_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeChunk(SQLModel, table=True):
    id: str = Field(primary_key=True)
    source_id: str = Field(foreign_key="knowledgesource.id", index=True)
    content: str
    vector_id: Optional[str] = None # Referência externa para Pinecone/Milvus
    tokens: int = 0
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))

class SynergyRoom(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # ex: "Brainstorm de Produto"
    type: str = "canvas" # canvas, huddle
    created_by_id: str = Field(foreign_key="user.id")
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CanvasElement(SQLModel, table=True):
    id: str = Field(primary_key=True)
    room_id: str = Field(foreign_key="synergyroom.id", index=True)
    type: str # text, sticky, shape, arrow
    content_json: dict = Field(default={}, sa_column=Column(JSON)) # Posição, cor, texto, etc.
    last_modified_by_id: str = Field(foreign_key="user.id")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StickyNote(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    context_type: str # conversation, lead, deal, canvas
    context_id: str # ID do objeto vinculado
    content: str
    color: str = "yellow"
    author_id: str = Field(foreign_key="user.id")
    position_json: dict = Field(default={}, sa_column=Column(JSON)) # Caso esteja flutuando na UI
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserDevice(SQLModel, table=True):
    id: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    device_name: str # ex: "MacBook Pro de Rodrigo"
    os_type: str # macos, windows, linux, ios, android
    app_version: str
    is_native: bool = True
    push_token: Optional[str] = None
    global_shortcut_enabled: bool = True
    last_sync_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RegionalTaxRule(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    country_code: str # BR, US, PT
    region_name: Optional[str] = None # Estado ou Província
    tax_name: str # ICMS, VAT, Sales Tax
    tax_rate: float # 0.18 for 18%
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DeveloperApp(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    description: Optional[str] = None
    client_id: str = Field(unique=True, index=True)
    client_secret_hash: str
    redirect_uris: str # Comma separated
    status: str = "development" # development, pending_review, published, suspended
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AppVersion(SQLModel, table=True):
    id: str = Field(primary_key=True)
    app_id: str = Field(foreign_key="developerapp.id", index=True)
    version_string: str # ex: 1.0.0
    changelog: Optional[str] = None
    manifest_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WebhookLog(SQLModel, table=True):
    id: str = Field(primary_key=True)
    app_id: str = Field(foreign_key="developerapp.id", index=True)
    event_type: str # lead.created, message.received
    payload_json: dict = Field(default={}, sa_column=Column(JSON))
    response_code: int
    response_body: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditStreamConfig(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    destination_url: str # Endpoint do SIEM/SOC
    auth_header: Optional[str] = None
    is_active: bool = True
    event_filters: str = "*" # Comma separated event types
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RegionHealth(SQLModel, table=True):
    id: str = Field(primary_key=True)
    region_name: str # us-east-1, eu-west-1, sa-east-1
    status: str = "operational" # operational, degraded, down
    latency_ms: int
    load_percentage: float
    last_check_at: datetime = Field(default_factory=datetime.utcnow)

class ProductSKU(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    description: Optional[str] = None
    barcode: Optional[str] = Field(unique=True, index=True)
    base_price: float
    currency: str = "BRL"
    is_digital: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Warehouse(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # ex: Depósito Central SP
    location_json: dict = Field(default={}, sa_column=Column(JSON)) # Lat/Lng, Address
    created_at: datetime = Field(default_factory=datetime.utcnow)

class InventoryMovement(SQLModel, table=True):
    id: str = Field(primary_key=True)
    sku_id: str = Field(foreign_key="productsku.id", index=True)
    warehouse_id: str = Field(foreign_key="warehouse.id", index=True)
    quantity_change: float # Positivo para entrada, negativo para saída
    reason: str # sale, restock, return, adjustment
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ShippingOrder(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    order_id: str # Relacionamento com lead/deal ou order
    tracking_number: Optional[str] = None
    carrier_name: str # Fedex, Correios, Loggi
    status: str = "pending" # pending, shipped, in_transit, delivered, failed
    shipping_cost: float
    estimated_delivery: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StrategyScenario(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str # ex: "Aumento de 10% no Preço do Pro"
    parameters_json: dict = Field(default={}, sa_column=Column(JSON)) # ROI, Churn, Price changes
    projected_revenue: float
    confidence_score: float # 0 to 1
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AnalysisNarrative(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    period: str # 2024-Q1, 2024-03
    narrative_html: str # Texto rico gerado pelo Jarvis
    key_metrics_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- CREATIVE ADDENDUM v1.1 ---

class IntakeItem(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    source_type: str # whatsapp, telegram, email, upload
    file_type: str # text, audio, image, video, pdf, xlsx
    file_url: Optional[str] = None
    text_content: Optional[str] = None
    stt_text: Optional[str] = None # Speech-to-text
    intent: str = "content" # content, ads, community, moderation, analytics, ops
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    status: str = "pending" # pending, processed, archived
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CreativeJob(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    intake_item_id: Optional[str] = Field(default=None, foreign_key="intakeitem.id")
    job_type: str # social_post, ad_campaign, ugc_video, product_photo
    persona_profile_id: str = Field(foreign_key="personaprofile.id")
    knowledge_pack_id: str = Field(foreign_key="knowledgepack.id")
    approval_mode: str = "semi" # auto, semi, manual
    status: str = "draft" # draft, running, completed, failed
    created_at: datetime = Field(default_factory=datetime.utcnow)

class JobRun(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    creative_job_id: str = Field(foreign_key="creativejob.id")
    pipeline_name: str
    output_summary: Optional[str] = None
    cost_usage_json: dict = Field(default={}, sa_column=Column(JSON))
    status: str = "success"
    started_at: datetime = Field(default_factory=datetime.utcnow)
    finished_at: Optional[datetime] = None

class PersonaProfile(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    tone_json: dict = Field(default={}, sa_column=Column(JSON)) # formal, casual, etc.
    do_dont_json: dict = Field(default={}, sa_column=Column(JSON))
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgePack(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    sources_json: dict = Field(default={}, sa_column=Column(JSON)) # URLs, File IDs
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BrandStylePack(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    colors_json: dict = Field(default={}, sa_column=Column(JSON))
    typography_json: dict = Field(default={}, sa_column=Column(JSON))
    is_default: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MediaAsset(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    asset_type: str # image, video, audio
    title: str
    description: Optional[str] = None
    storage_url: str
    preview_url: Optional[str] = None
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    campaign_id: Optional[str] = None
    tags_json: dict = Field(default=[], sa_column=Column(JSON))
    provenance_json: dict = Field(default={}, sa_column=Column(JSON)) # {prompt_id, model, provider}
    rights_json: dict = Field(default={"license": "standard"}, sa_column=Column(JSON))
    qa_status: str = "pending" # pending, approved, rejected
    risk_score: float = 0.0 # 0.0 to 1.0
    version: int = 1
    parent_asset_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PromptArtifact(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    prompt_type: str # text_to_image, text_to_video, music_gen
    model_provider: str # openai, anthropic, midjourney, runaway
    model_name: str
    prompt_text: str
    negative_prompt_text: Optional[str] = None
    params_json: dict = Field(default={}, sa_column=Column(JSON))
    input_refs_json: dict = Field(default=[], sa_column=Column(JSON)) # Intake item or other assets
    output_asset_id: Optional[str] = Field(default=None, foreign_key="mediaasset.id")
    qa_status: str = "pending"
    risk_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AvatarProfile(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    persona_id: Optional[str] = Field(default=None, foreign_key="personaprofile.id")
    visual_refs_json: dict = Field(default=[], sa_column=Column(JSON)) # Reference assets
    is_brand_default: bool = False
    metadata_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VoiceProfile(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    provider: str # elevenlabs, playht, openai
    voice_id: str
    settings_json: dict = Field(default={}, sa_column=Column(JSON)) # pitch, stability, etc
    sample_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AvatarScene(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    avatar_id: str = Field(foreign_key="avatarprofile.id")
    voice_id: Optional[str] = Field(default=None, foreign_key="voiceprofile.id")
    script_text: str
    background_type: str # green_screen, generated_scene, static
    scene_asset_id: Optional[str] = Field(default=None, foreign_key="mediaasset.id")
    status: str = "draft" # draft, rendering, completed, failed
    output_video_id: Optional[str] = Field(default=None, foreign_key="mediaasset.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AutomationTrigger(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    name: str
    trigger_type: str # cron, trend_hit, webhook
    config_json: dict = Field(default={}, sa_column=Column(JSON)) # {schedule, threshold, etc}
    action_type: str # generate_meme, generate_ad, alert_team
    action_params_json: dict = Field(default={}, sa_column=Column(JSON))
    is_active: bool = True
    last_run_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PublicationSchedule(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    asset_id: str = Field(foreign_key="mediaasset.id")
    platform: str # instagram, tiktok, twitter, linkedin
    scheduled_for: datetime
    caption: Optional[str] = None
    status: str = "pending" # pending, published, failed
    external_post_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdAccount(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    platform: str # meta, google, tiktok
    external_account_id: str
    name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdCampaign(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    ad_account_id: str = Field(foreign_key="adaccount.id")
    asset_id: str = Field(foreign_key="mediaasset.id")
    name: str
    budget: float
    status: str # active, paused, ended
    performance_metrics_json: dict = Field(default={}, sa_column=Column(JSON)) # ROAS, CPA, Impressions
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetAllocation(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    platform: str
    amount: float
    month: str # YYYY-MM
    performance_score: float = 0.0
    strategy_json: dict = Field(default={}, sa_column=Column(JSON)) # Meta: 40%, Google: 60%
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AICostLog(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    job_id: Optional[str] = Field(default=None, foreign_key="creativejob.id")
    provider: str # openai, anthropic, midjourney, elevenlabs
    model_name: str
    tokens_used: int = 0
    pixels_generated: int = 0
    estimated_cost_usd: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssetAuditLog(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    asset_id: str = Field(foreign_key="mediaasset.id")
    user_id: str = Field(foreign_key="user.id")
    action: str # create, modify, view, download, rollback
    previous_state_json: dict = Field(default={}, sa_column=Column(JSON))
    new_state_json: dict = Field(default={}, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AssetBackupConfig(SQLModel, table=True):
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True, unique=True)
    provider: str # s3, gcs, azure
    region: str
    bucket_name: str
    replication_enabled: bool = True
    retention_days: int = 365
    last_backup_at: Optional[datetime] = None


# ─────────────────────────────────────────────
# OMNIMIND INTEGRATION MODELS
# ─────────────────────────────────────────────

class WebhookSubscription(SQLModel, table=True):
    """Outbound webhook subscriptions — Pulse sends events to registered URLs."""
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    integration_id: str = Field(foreign_key="integration.id", index=True)
    target_url: str
    secret_key: str  # Used for HMAC-SHA256 signing
    events_json: List[str] = Field(default=[], sa_column=Column(JSON))
    is_active: bool = True
    last_delivery_at: Optional[datetime] = None
    failure_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

class WebhookDispatchLog(SQLModel, table=True):
    """Log of every outbound webhook delivery attempt."""
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    subscription_id: str = Field(foreign_key="webhooksubscription.id", index=True)
    event_type: str
    payload_json: dict = Field(default={}, sa_column=Column(JSON))
    response_code: Optional[int] = None
    response_body: Optional[str] = None
    attempt: int = 1
    status: str = "pending"  # pending, delivered, failed
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceToken(SQLModel, table=True):
    """Service-to-service API key for machine clients like OmniMind."""
    id: str = Field(primary_key=True)
    tenant_id: str = Field(foreign_key="tenant.id", index=True)
    integration_id: str = Field(foreign_key="integration.id", index=True)
    token_hash: str = Field(index=True)  # SHA-256 hash of the raw token
    name: str  # "OmniMind Production", "OmniMind Staging"
    scopes_json: List[str] = Field(default=[], sa_column=Column(JSON))
    is_active: bool = True
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
