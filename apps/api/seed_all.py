"""
Complete seed for Naboah Pulse — populates ALL tables with realistic demo data.
Run: cd apps/api && python3 seed_all.py
"""
import uuid
import random
import hashlib
from datetime import datetime, timedelta
from config import settings
from sqlalchemy import create_engine
from sqlmodel import Session, select
from db import init_db
from models import (
    Tenant, User, Role, Permission, Membership, AuditLog, Channel, ChannelAccount,
    Contact, Conversation, Message, ContentAsset, Campaign, CalendarItem,
    ModerationPolicy, ModerationEvent, Integration, CustomConnector, Webhook,
    Playbook, Agent, AgentCollaboration, AgentTask, SubscriptionPlan, UsageQuota,
    CreditTransaction, APIKey, Workflow, WorkflowStep, WorkflowRun, PipelineStage,
    Deal, Ticket, SLAPolicy, KBArticle, App, AppInstallation, CallRecord, Voicemail,
    ForumTopic, ForumPost, FeatureRequest, UserBadge, Product, Order, OrderItem,
    PaymentTransaction, BusinessForecast, SecurityAlert, AuditSession, DLPPolicy,
    UIState, WidgetConfig, KnowledgeSource, KnowledgeChunk, SynergyRoom,
    CanvasElement, StickyNote, UserDevice, RegionalTaxRule, DeveloperApp, AppVersion,
    WebhookLog, AuditStreamConfig, RegionHealth, ProductSKU, Warehouse,
    InventoryMovement, ShippingOrder, StrategyScenario, AnalysisNarrative,
    IntakeItem, CreativeJob, JobRun, PersonaProfile, KnowledgePack, BrandStylePack,
    MediaAsset, PromptArtifact, AvatarProfile, VoiceProfile, AvatarScene,
    AutomationTrigger, PublicationSchedule, AdAccount, AdCampaign, BudgetAllocation,
    AICostLog, AssetAuditLog, AssetBackupConfig, ConnectorMapping,
)

TENANT_ID = "naboah"
USER_ID = "user_system"
engine = create_engine(settings.DATABASE_URL)


def ago(days=0, hours=0, minutes=0):
    return datetime.utcnow() - timedelta(days=days, hours=hours, minutes=minutes)


def uid(prefix=""):
    return f"{prefix}{uuid.uuid4().hex[:8]}"


def exists(db, model, id_val):
    return db.get(model, id_val) is not None


def seed():
    init_db()
    with Session(engine) as db:
        print("=" * 50)
        print("  NABOAH PULSE — Full Seed")
        print("=" * 50)

        # ── 1. Tenant ──
        if not exists(db, Tenant, TENANT_ID):
            db.add(Tenant(id=TENANT_ID, name="Naboah", slug=TENANT_ID,
                          primary_color="#7B61FF",
                          ai_persona_config={"name": "Pulse AI", "avatar": None},
                          health_score=92.5,
                          growth_projections_json={"q1": 15, "q2": 22, "q3": 28, "q4": 35}))
            db.commit()
        print("✓ Tenant")

        # ── 2. User ──
        if not exists(db, User, USER_ID):
            db.add(User(id=USER_ID, email="admin@naboah.com",
                        hashed_password="$2b$12$placeholder", full_name="Rodrigo Nicolau",
                        privacy_consents='{"analytics": true, "marketing": true, "third_party": false}'))
            db.commit()
        print("✓ User")

        # ── 3. Roles & Membership ──
        for r in [("role_admin", "Admin"), ("role_agent", "Agent"), ("role_viewer", "Viewer")]:
            if not exists(db, Role, r[0]):
                db.add(Role(id=r[0], name=r[1], tenant_id=TENANT_ID))
        db.commit()
        try:
            db.add(Membership(user_id=USER_ID, tenant_id=TENANT_ID, role_id="role_admin"))
            db.commit()
        except Exception:
            db.rollback()
        print("✓ Roles & Membership")

        # ── 4. Channels & Channel Accounts ──
        ca_map = {}
        for ch in ["whatsapp", "instagram", "email", "facebook"]:
            if not exists(db, Channel, ch):
                db.add(Channel(id=ch, type=ch, name=ch.capitalize()))
            ca_id = f"ca_{TENANT_ID}_{ch}"
            if not exists(db, ChannelAccount, ca_id):
                db.add(ChannelAccount(id=ca_id, tenant_id=TENANT_ID, channel_id=ch,
                                      external_account_id=f"{TENANT_ID}_{ch}_001",
                                      auth_blob_encrypted="{}", status="active",
                                      health_metrics={"uptime": 99.9, "avg_response_ms": 120}))
            ca_map[ch] = ca_id
        db.commit()
        print("✓ Channels")

        # ── 5. Contacts ──
        CONTACTS = [
            {"name": "Maria Silva", "email": "maria@techcorp.com", "phone": "+5511991234567", "ltv": 24000, "risk": "low"},
            {"name": "João Mendes", "email": "joao@agencia.io", "phone": "+5521998765432", "ltv": 8400, "risk": "low"},
            {"name": "Ana Rodrigues", "email": "ana.r@startup.com", "phone": "+5531987654321", "ltv": 3600, "risk": "medium"},
            {"name": "Carlos Eduardo", "email": "carlos@globalcorp.com", "phone": "+5541976543210", "ltv": 60000, "risk": "low"},
            {"name": "Fernanda Lima", "email": "fernanda@design.co", "phone": "+5551965432109", "ltv": 1200, "risk": "high"},
            {"name": "Pedro Alves", "email": "pedro@ecomm.shop", "phone": "+5561954321098", "ltv": 5400, "risk": "medium"},
            {"name": "Juliana Costa", "email": "juliana@finance.br", "phone": "+5571943210987", "ltv": 14400, "risk": "low"},
            {"name": "Rafael Torres", "email": "rafael@consulting.io", "phone": "+5581932109876", "ltv": 7200, "risk": "low"},
            {"name": "Beatriz Nunes", "email": "bia@healthtech.com", "phone": "+5591921098765", "ltv": 14400, "risk": "low"},
            {"name": "Thiago Rocha", "email": "thiago@logistica.net", "phone": "+5511910987654", "ltv": 9600, "risk": "medium"},
            {"name": "Camila Ferreira", "email": "camila@edu.br", "phone": "+5521909876543", "ltv": 4800, "risk": "low"},
            {"name": "Lucas Souza", "email": "lucas@saas.co", "phone": "+5531898765432", "ltv": 18000, "risk": "low"},
        ]
        contact_ids = []
        for i, c in enumerate(CONTACTS):
            cid = f"contact_{TENANT_ID}_{i}"
            if not exists(db, Contact, cid):
                db.add(Contact(id=cid, tenant_id=TENANT_ID, name=c["name"], email=c["email"],
                               phone=c["phone"], health_score=round(random.uniform(65, 100), 1),
                               predicted_ltv=c["ltv"], churn_risk_level=c["risk"],
                               tags_json=random.sample(["vip", "enterprise", "trial", "active", "lead"], 2)))
            contact_ids.append(cid)
        db.commit()
        print(f"✓ {len(CONTACTS)} Contacts")

        # ── 6. Conversations & Messages (from seed_rich pattern) ──
        CONVS = [
            {"ch": "whatsapp", "ci": 0, "status": "open", "priority": "urgent", "intent": "support", "d": 0, "msgs": [
                ("inbound", "contact", "Oi! Meu sistema caiu. Preciso de ajuda urgente!", 0, 30),
                ("outbound", "agent", "Olá Maria! Verificando agora. Pode me informar seu ID de conta?", 0, 28),
                ("inbound", "contact", "É a conta MC-4821. Estou sem acesso há 2 horas", 0, 25),
                ("outbound", "agent", "Instabilidade identificada. Resolvendo em até 10 minutos.", 0, 20),
            ]},
            {"ch": "whatsapp", "ci": 1, "status": "open", "priority": "high", "intent": "sales", "d": 1, "msgs": [
                ("inbound", "contact", "Quero saber mais sobre o plano Enterprise do Naboah Pulse", 1, 5),
                ("outbound", "user", "Olá João! Temos uma proposta incrível. Posso agendar uma call?", 1, 2),
                ("inbound", "contact", "Quantos usuários suporta? E tem API?", 1, 0),
            ]},
            {"ch": "instagram", "ci": 4, "status": "open", "priority": "high", "intent": "sales", "d": 0, "msgs": [
                ("inbound", "contact", "Vi vocês no Instagram! O que é o Naboah Pulse?", 0, 45),
                ("outbound", "agent", "Somos uma plataforma omnichannel com IA. WhatsApp, Instagram e Email em um só lugar.", 0, 40),
                ("inbound", "contact", "Quero uma demo gratuita!", 0, 15),
            ]},
            {"ch": "email", "ci": 7, "status": "open", "priority": "urgent", "intent": "security", "d": 0, "msgs": [
                ("inbound", "contact", "URGENT: Detected suspicious login attempts from Brazil/SP", 0, 120),
                ("outbound", "agent", "We've secured your account. Please reset your password.", 0, 115),
                ("inbound", "contact", "Done. Is my data safe?", 0, 100),
            ]},
            {"ch": "email", "ci": 8, "status": "open", "priority": "medium", "intent": "billing", "d": 2, "msgs": [
                ("inbound", "contact", "Gostaria de fazer o upgrade para o plano Pro", 2, 180),
                ("outbound", "user", "No Pro: 5 agentes IA, integrações ilimitadas e BI avançado. R$499/mês.", 2, 175),
            ]},
            {"ch": "whatsapp", "ci": 11, "status": "open", "priority": "medium", "intent": "demo", "d": 0, "msgs": [
                ("inbound", "contact", "Quero agendar demo do Naboah Pulse", 0, 90),
                ("outbound", "agent", "Temos horários essa semana. Quinta às 10h?", 0, 85),
                ("inbound", "contact", "Perfeito! Confirmado.", 0, 80),
            ]},
        ]
        for i, cv in enumerate(CONVS):
            conv_id = f"conv_{TENANT_ID}_{i}"
            if not exists(db, Conversation, conv_id):
                ts = ago(days=cv["d"])
                db.add(Conversation(id=conv_id, tenant_id=TENANT_ID, channel_account_id=ca_map[cv["ch"]],
                                    contact_id=contact_ids[cv["ci"]], external_thread_id=f"thread_{i}",
                                    status=cv["status"], priority=cv["priority"], intent=cv["intent"],
                                    sla_due_at=datetime.utcnow() + timedelta(hours=4),
                                    created_at=ts, updated_at=ts))
                db.commit()
                for j, (d, st, content, dd, mm) in enumerate(cv["msgs"]):
                    db.add(Message(id=f"msg_{TENANT_ID}_{i}_{j}", tenant_id=TENANT_ID,
                                   conversation_id=conv_id, external_message_id=f"ext_{i}_{j}",
                                   direction=d, sender_type=st, content=content,
                                   sentiment_score=round(random.uniform(-0.2, 0.9), 2),
                                   created_at=ago(days=dd, minutes=mm)))
                db.commit()
        print(f"✓ {len(CONVS)} Conversations + Messages")

        # ── 7. Pipeline & Deals ──
        STAGES = [
            ("stg_1", "Lead Qualificado", 1, "#7B61FF"),
            ("stg_2", "Apresentação", 2, "#8B5CF6"),
            ("stg_3", "Negociação", 3, "#F59E0B"),
            ("stg_4", "Fechamento", 4, "#22C55E"),
        ]
        for sid, name, order, color in STAGES:
            if not exists(db, PipelineStage, sid):
                db.add(PipelineStage(id=sid, tenant_id=TENANT_ID, name=name, order=order, color=color))
        db.commit()

        DEALS = [
            ("TechCorp - Enterprise Anual", 24000, "stg_4", "Maria Silva", "maria@techcorp.com", "whatsapp", 95),
            ("SaaS Co - Enterprise Trial", 18000, "stg_4", "Lucas Souza", "lucas@saas.co", "whatsapp", 91),
            ("Agência Digital - Pro Anual", 8400, "stg_3", "João Mendes", "joao@agencia.io", "email", 82),
            ("Startup X - Pilot 3 meses", 3600, "stg_3", "Ana Rodrigues", "ana.r@startup.com", "instagram", 71),
            ("Global Corp - 50 seats", 60000, "stg_2", "Carlos Eduardo", "carlos@globalcorp.com", "email", 78),
            ("Design Studio - Pro Mensal", 1200, "stg_2", "Fernanda Lima", "fernanda@design.co", "instagram", 65),
            ("E-commerce Plus", 5400, "stg_1", "Pedro Alves", "pedro@ecomm.shop", "whatsapp", 55),
            ("HealthTech - Business Plan", 14400, "stg_1", "Beatriz Nunes", "bia@healthtech.com", "email", 60),
        ]
        for i, (title, val, stg, name, email, src, score) in enumerate(DEALS):
            did = f"deal_{TENANT_ID}_{i}"
            if not exists(db, Deal, did):
                db.add(Deal(id=did, tenant_id=TENANT_ID, title=title, value=val, stage_id=stg,
                            contact_name=name, contact_email=email, source=src, lead_score=score,
                            created_at=ago(days=i), updated_at=ago(days=i)))
        db.commit()
        print(f"✓ {len(DEALS)} Deals")

        # ── 8. Tickets & KB ──
        TICKETS = [
            ("Bug crítico no upload de arquivos", "Erro 500 ao fazer upload > 10MB", "high", "open", 4),
            ("Integração WhatsApp retornando 401", "Token parece válido mas API retorna 401", "urgent", "open", 2),
            ("Automação não dispara fora do horário", "Bot não responde após 18h", "medium", "new", 24),
            ("Exportação de relatórios CSV", "Não encontro opção de exportar CSV", "low", "pending", 48),
            ("Acesso multi-tenant", "Preciso gerenciar 3 empresas no mesmo painel", "low", "new", 72),
            ("Erro ao importar contatos via CSV", "Validação falha nos campos phone e email", "medium", "open", 12),
        ]
        for i, (subj, desc, pri, st, due_h) in enumerate(TICKETS):
            tid = f"tick_{TENANT_ID}_{i}"
            if not exists(db, Ticket, tid):
                db.add(Ticket(id=tid, tenant_id=TENANT_ID, subject=subj, description=desc,
                              priority=pri, status=st, created_at=ago(days=i),
                              due_at=datetime.utcnow() + timedelta(hours=due_h)))
        db.commit()

        KB_ARTICLES = [
            ("Como configurar automações", "Acesse Configurações > Automações para criar regras de resposta automática...", "Automação"),
            ("Integrando WhatsApp Business", "Passo 1: Acesse Meta Business Suite. Passo 2: Gere token de acesso...", "Integrações"),
            ("Gerenciando Pipeline de Vendas", "O pipeline do Naboah Pulse permite arrastar deals entre estágios...", "Vendas"),
            ("Configuração de SLA", "Defina tempos de resposta por prioridade em Configurações > SLA...", "Suporte"),
            ("API Reference — Webhooks", "Endpoints disponíveis: POST /webhook/messages, GET /webhook/status...", "Developer"),
        ]
        for i, (title, content, cat) in enumerate(KB_ARTICLES):
            kid = f"kb_{TENANT_ID}_{i}"
            if not exists(db, KBArticle, kid):
                db.add(KBArticle(id=kid, tenant_id=TENANT_ID, title=title, content=content,
                                 category=cat, is_published=True, author_id=USER_ID))
        db.commit()

        SLA_POLICIES = [
            ("SLA Urgent", "urgent", 1, 4),
            ("SLA High", "high", 2, 8),
            ("SLA Medium", "medium", 4, 24),
            ("SLA Low", "low", 8, 48),
        ]
        for i, (name, pri, resp, res) in enumerate(SLA_POLICIES):
            sid = f"sla_{TENANT_ID}_{i}"
            if not exists(db, SLAPolicy, sid):
                db.add(SLAPolicy(id=sid, tenant_id=TENANT_ID, name=name, priority=pri,
                                 response_time_hours=resp, resolution_time_hours=res))
        db.commit()
        print("✓ Tickets, KB, SLA")

        # ── 9. Playbooks & Agents ──
        PLAYBOOKS = [
            ("pb_support", "Support Playbook", "support", "empathetic"),
            ("pb_sales", "Sales Playbook", "sales", "persuasive"),
            ("pb_security", "Security Playbook", "security", "formal"),
            ("pb_growth", "Growth Playbook", "marketing", "creative"),
        ]
        for pid, name, dept, tone in PLAYBOOKS:
            if not exists(db, Playbook, pid):
                db.add(Playbook(id=pid, tenant_id=TENANT_ID, name=name, department=dept,
                                tone_of_voice=tone, is_default=True,
                                rules_json={"max_response_time": 60, "escalation_threshold": 3}))
        db.commit()

        AGENTS = [
            ("ag_support", "Aria", "support_lead", "acting", "high", "pb_support",
             ["ticket_resolve", "crm_access", "kb_search"]),
            ("ag_sales", "Nexus", "growth_hacker", "acting", "genius", "pb_sales",
             ["deal_management", "email_outreach", "pipeline_analytics"]),
            ("ag_security", "Sentinel", "security_officer", "idle", "high", "pb_security",
             ["threat_detection", "audit_review", "dlp_enforcement"]),
            ("ag_growth", "Spark", "content_creator", "thinking", "high", "pb_growth",
             ["content_generate", "campaign_optimize", "trend_analysis"]),
        ]
        for aid, name, role, status, intel, pbid, skills in AGENTS:
            if not exists(db, Agent, aid):
                db.add(Agent(id=aid, tenant_id=TENANT_ID, playbook_id=pbid, name=name,
                             role=role, status=status, intelligence_level=intel,
                             skills_json=skills, capabilities_json=skills,
                             handoff_rules_json={"fallback": "ag_support"}))
        db.commit()

        # Agent Tasks
        TASKS = [
            ("ag_support", "reply_inbox", "completed", {"conversation_id": f"conv_{TENANT_ID}_0"}),
            ("ag_sales", "schedule_post", "in_progress", {"campaign": "Q1 Launch"}),
            ("ag_growth", "analyze_sentiment", "pending", {"target": "last_7_days"}),
        ]
        for i, (aid, typ, st, inp) in enumerate(TASKS):
            tid = f"task_{TENANT_ID}_{i}"
            if not exists(db, AgentTask, tid):
                db.add(AgentTask(id=tid, tenant_id=TENANT_ID, agent_id=aid, type=typ,
                                 status=st, input_payload=inp))
        db.commit()
        print("✓ Playbooks, Agents, Tasks")

        # ── 10. Workflows ──
        WFS = [
            ("wf_cart", "Recuperação de Carrinho", "Envia mensagem quando carrinho é abandonado",
             "webhook", [
                 ("trigger", "webhook_receive", 100, 50, "trigger"),
                 ("action", "delay_30min", 300, 50, "logic"),
                 ("action", "send_whatsapp", 500, 50, "action"),
                 ("condition", "check_purchase", 700, 50, "logic"),
                 ("action", "send_discount", 900, 100, "action"),
             ]),
            ("wf_welcome", "Onboarding Welcome", "Série de boas-vindas para novos leads",
             "lead_created", [
                 ("trigger", "lead_created", 100, 50, "trigger"),
                 ("action", "send_email_welcome", 300, 50, "action"),
                 ("action", "delay_24h", 500, 50, "logic"),
                 ("action", "send_whatsapp_tips", 700, 50, "action"),
             ]),
        ]
        for wid, name, desc, trigger, steps in WFS:
            if not exists(db, Workflow, wid):
                db.add(Workflow(id=wid, tenant_id=TENANT_ID, name=name, description=desc,
                                trigger_type=trigger, is_active=True,
                                viewport_json={"x": 0, "y": 0, "zoom": 1}))
                db.commit()
                for j, (stype, action, px, py, ntype) in enumerate(steps):
                    db.add(WorkflowStep(id=f"{wid}_s{j}", workflow_id=wid, type=stype,
                                        action_type=action, position_x=px, position_y=py,
                                        node_type=ntype, config="{}",
                                        next_step_id=f"{wid}_s{j+1}" if j < len(steps)-1 else None))
                db.commit()
                # Add runs
                for k in range(3):
                    db.add(WorkflowRun(id=f"{wid}_run{k}", workflow_id=wid,
                                       status=random.choice(["completed", "completed", "failed"]),
                                       logs=f"Execution {k+1}: processed 12 items",
                                       created_at=ago(days=k)))
                db.commit()
        print("✓ Workflows + Steps + Runs")

        # ── 11. Content & Creative ──
        CONTENT_ASSETS = [
            ("Post Instagram — Lançamento Q1", "post", "Descubra o novo Naboah Pulse! IA que transforma atendimento.", "approved"),
            ("Script YouTube — Tutorial Automações", "script", "Neste vídeo vamos aprender a criar automações...", "approved"),
            ("Caption LinkedIn — Case TechCorp", "caption", "Como a TechCorp aumentou vendas em 45% com Naboah Pulse.", "pending"),
            ("Email Marketing — Black Friday", "post", "Oferta exclusiva: 50% de desconto no plano Enterprise!", "approved"),
            ("Blog Post — Tendências IA 2026", "script", "As 5 tendências de IA para atendimento ao cliente em 2026...", "pending"),
        ]
        for i, (title, typ, body, qa) in enumerate(CONTENT_ASSETS):
            cid = f"ca_{TENANT_ID}_{i}"
            if not exists(db, ContentAsset, cid):
                db.add(ContentAsset(id=cid, tenant_id=TENANT_ID, type=typ, title=title,
                                    body=body, qa_status=qa, risk_score=round(random.uniform(0, 0.2), 2),
                                    metadata_json={"word_count": len(body.split()), "language": "pt-BR"}))
        db.commit()

        CAMPAIGNS = [
            ("Lançamento Q1 2026", "brand_awareness", 15000, "active"),
            ("Black Friday 2026", "conversions", 50000, "draft"),
            ("Webinar — IA no Atendimento", "lead_generation", 5000, "active"),
        ]
        for i, (name, goal, budget, status) in enumerate(CAMPAIGNS):
            cmpid = f"cmp_{TENANT_ID}_{i}"
            if not exists(db, Campaign, cmpid):
                db.add(Campaign(id=cmpid, tenant_id=TENANT_ID, name=name, goal=goal,
                                budget=budget, status=status))
        db.commit()

        # Calendar Items
        for i in range(6):
            calid = f"cal_{TENANT_ID}_{i}"
            if not exists(db, CalendarItem, calid):
                db.add(CalendarItem(id=calid, tenant_id=TENANT_ID,
                                    channel_account_id=ca_map[random.choice(["instagram", "whatsapp"])],
                                    content_asset_id=f"ca_{TENANT_ID}_{i % len(CONTENT_ASSETS)}",
                                    scheduled_at=datetime.utcnow() + timedelta(days=i+1, hours=10),
                                    status="scheduled" if i > 0 else "published",
                                    approval_mode="semi"))
        db.commit()
        print("✓ Content, Campaigns, Calendar")

        # ── 12. Personas, Knowledge Packs, Brand Styles ──
        PERSONAS = [
            ("Voz Profissional", {"formality": "high", "humor": "none", "empathy": "high"},
             {"do": ["usar dados", "ser conciso"], "dont": ["usar gírias", "prometer prazos"]}),
            ("Voz Criativa", {"formality": "low", "humor": "moderate", "empathy": "high"},
             {"do": ["usar emojis", "ser entusiasta"], "dont": ["ser genérico", "copiar concorrentes"]}),
        ]
        for i, (name, tone, dodont) in enumerate(PERSONAS):
            pid = f"persona_{TENANT_ID}_{i}"
            if not exists(db, PersonaProfile, pid):
                db.add(PersonaProfile(id=pid, tenant_id=TENANT_ID, name=name,
                                      tone_json=tone, do_dont_json=dodont, is_default=i == 0))
        db.commit()

        KPACKS = [
            ("Knowledge Base Principal", {"urls": ["https://docs.naboah.com"], "files": ["manual_v2.pdf"]}),
            ("FAQ & Troubleshooting", {"urls": ["https://faq.naboah.com"], "files": ["troubleshoot.pdf"]}),
        ]
        for i, (name, sources) in enumerate(KPACKS):
            kid = f"kpack_{TENANT_ID}_{i}"
            if not exists(db, KnowledgePack, kid):
                db.add(KnowledgePack(id=kid, tenant_id=TENANT_ID, name=name,
                                     sources_json=sources, is_default=i == 0))
        db.commit()

        bsp_id = f"bsp_{TENANT_ID}_0"
        if not exists(db, BrandStylePack, bsp_id):
            db.add(BrandStylePack(id=bsp_id, tenant_id=TENANT_ID, name="Naboah Brand",
                                  colors_json={"primary": "#7B61FF", "secondary": "#2DD4BF", "bg": "#070A10"},
                                  typography_json={"heading": "Inter", "body": "Inter", "mono": "JetBrains Mono"},
                                  is_default=True))
        db.commit()
        print("✓ Personas, Knowledge Packs, Brand Styles")

        # ── 13. Media Assets ──
        MEDIA = [
            ("image", "Hero Banner Q1", "Banner principal da campanha Q1", "https://storage.naboah.com/banner-q1.jpg"),
            ("image", "Product Screenshot", "Screenshot do dashboard Pulse", "https://storage.naboah.com/screenshot.jpg"),
            ("video", "Demo Video 60s", "Vídeo curto de demonstração", "https://storage.naboah.com/demo-60s.mp4"),
            ("image", "Social Post — IA", "Post sobre features de IA", "https://storage.naboah.com/post-ia.jpg"),
            ("audio", "Podcast Ep. 1", "Primeiro episódio do podcast Naboah", "https://storage.naboah.com/podcast-1.mp3"),
        ]
        for i, (atype, title, desc, url) in enumerate(MEDIA):
            mid = f"media_{TENANT_ID}_{i}"
            if not exists(db, MediaAsset, mid):
                db.add(MediaAsset(id=mid, tenant_id=TENANT_ID, asset_type=atype, title=title,
                                  description=desc, storage_url=url, qa_status="approved",
                                  tags_json=["brand", "marketing"],
                                  provenance_json={"source": "manual_upload"},
                                  metadata_json={"size_mb": round(random.uniform(0.5, 50), 1)}))
        db.commit()
        print("✓ Media Assets")

        # ── 14. Avatars & Voice ──
        for i, (name, is_default) in enumerate([("Aria — Brand Avatar", True), ("Nexus — Sales Avatar", False)]):
            avid = f"avatar_{TENANT_ID}_{i}"
            if not exists(db, AvatarProfile, avid):
                db.add(AvatarProfile(id=avid, tenant_id=TENANT_ID, name=name,
                                     persona_id=f"persona_{TENANT_ID}_{i}", is_brand_default=is_default,
                                     metadata_json={"style": "professional", "ethnicity": "diverse"}))
        db.commit()

        for i, (name, provider, vid) in enumerate([
            ("Voz Feminina PT-BR", "elevenlabs", "voice_pt_f_01"),
            ("Voz Masculina EN-US", "openai", "voice_en_m_01"),
        ]):
            vpid = f"voice_{TENANT_ID}_{i}"
            if not exists(db, VoiceProfile, vpid):
                db.add(VoiceProfile(id=vpid, tenant_id=TENANT_ID, name=name,
                                    provider=provider, voice_id=vid,
                                    settings_json={"stability": 0.75, "clarity": 0.85}))
        db.commit()

        # Avatar Scenes
        scene_id = f"scene_{TENANT_ID}_0"
        if not exists(db, AvatarScene, scene_id):
            db.add(AvatarScene(id=scene_id, tenant_id=TENANT_ID,
                               avatar_id=f"avatar_{TENANT_ID}_0", voice_id=f"voice_{TENANT_ID}_0",
                               script_text="Olá! Bem-vindo ao Naboah Pulse. Vou te mostrar como nossa IA pode transformar seu atendimento.",
                               background_type="generated_scene", status="completed"))
        db.commit()
        print("✓ Avatars, Voices, Scenes")

        # ── 15. Automation Triggers ──
        TRIGGERS = [
            ("Resposta Fora do Horário", "cron", "generate_meme", {"schedule": "0 18 * * *"}),
            ("Alerta de Trend Viral", "trend_hit", "alert_team", {"threshold": 1000}),
            ("Welcome New Lead", "webhook", "generate_ad", {"event": "lead.created"}),
            ("Cart Abandonment", "webhook", "generate_ad", {"event": "cart.abandoned"}),
        ]
        for i, (name, ttype, action, config) in enumerate(TRIGGERS):
            trid = f"trigger_{TENANT_ID}_{i}"
            if not exists(db, AutomationTrigger, trid):
                db.add(AutomationTrigger(id=trid, tenant_id=TENANT_ID, name=name,
                                         trigger_type=ttype, action_type=action,
                                         config_json=config, is_active=True,
                                         last_run_at=ago(hours=random.randint(1, 48))))
        db.commit()

        # Publication Schedule
        for i in range(4):
            psid = f"pubsched_{TENANT_ID}_{i}"
            if not exists(db, PublicationSchedule, psid):
                db.add(PublicationSchedule(id=psid, tenant_id=TENANT_ID,
                                           asset_id=f"media_{TENANT_ID}_{i % len(MEDIA)}",
                                           platform=["instagram", "tiktok", "linkedin", "twitter"][i],
                                           scheduled_for=datetime.utcnow() + timedelta(days=i+1),
                                           caption=f"Post #{i+1} — Naboah Pulse", status="pending"))
        db.commit()
        print("✓ Automation Triggers, Publication Schedule")

        # ── 16. Ads ──
        AD_ACCOUNTS = [
            ("Meta Business", "meta", "act_12345678"),
            ("Google Ads", "google", "ga_87654321"),
        ]
        for i, (name, platform, ext_id) in enumerate(AD_ACCOUNTS):
            aaid = f"adacc_{TENANT_ID}_{i}"
            if not exists(db, AdAccount, aaid):
                db.add(AdAccount(id=aaid, tenant_id=TENANT_ID, platform=platform,
                                 external_account_id=ext_id, name=name, is_active=True))
        db.commit()

        AD_CAMPAIGNS = [
            ("Meta — Awareness Q1", f"adacc_{TENANT_ID}_0", 5000, "active",
             {"roas": 3.2, "cpa": 12.50, "impressions": 45000, "clicks": 2800, "conversions": 120}),
            ("Meta — Retargeting", f"adacc_{TENANT_ID}_0", 3000, "active",
             {"roas": 4.8, "cpa": 8.20, "impressions": 22000, "clicks": 1800, "conversions": 95}),
            ("Google — Search Brand", f"adacc_{TENANT_ID}_1", 2000, "active",
             {"roas": 5.1, "cpa": 6.40, "impressions": 18000, "clicks": 2200, "conversions": 180}),
        ]
        for i, (name, acc, budget, st, metrics) in enumerate(AD_CAMPAIGNS):
            acid = f"adcmp_{TENANT_ID}_{i}"
            if not exists(db, AdCampaign, acid):
                db.add(AdCampaign(id=acid, tenant_id=TENANT_ID, ad_account_id=acc,
                                  asset_id=f"media_{TENANT_ID}_{i % len(MEDIA)}", name=name,
                                  budget=budget, status=st, performance_metrics_json=metrics))
        db.commit()

        BUDGET_ALLOCS = [
            ("meta", 8000, "2026-03", 78.5),
            ("google", 4000, "2026-03", 85.2),
            ("tiktok", 2000, "2026-03", 62.0),
        ]
        for i, (platform, amount, month, score) in enumerate(BUDGET_ALLOCS):
            baid = f"budget_{TENANT_ID}_{i}"
            if not exists(db, BudgetAllocation, baid):
                db.add(BudgetAllocation(id=baid, tenant_id=TENANT_ID, platform=platform,
                                        amount=amount, month=month, performance_score=score,
                                        strategy_json={"objective": "conversions", "bid_strategy": "auto"}))
        db.commit()
        print("✓ Ads, Campaigns, Budgets")

        # ── 17. Moderation ──
        MOD_POLICIES = [
            ("Anti-Spam Filter", "auto", {"keywords": ["compre agora", "clique aqui"], "threshold": 0.8}),
            ("Hate Speech Detection", "semi", {"model": "pulse-moderation-v2", "threshold": 0.6}),
        ]
        for i, (name, mode, rules) in enumerate(MOD_POLICIES):
            mpid = f"modpol_{TENANT_ID}_{i}"
            if not exists(db, ModerationPolicy, mpid):
                db.add(ModerationPolicy(id=mpid, tenant_id=TENANT_ID, name=name,
                                        mode=mode, rules_json=rules, is_active=True))
        db.commit()

        MOD_EVENTS = [
            ("comment", "spam", "hidden", 0.92, True),
            ("message", "hate", "deleted", 0.87, True),
            ("post", "safe", "none", 0.12, False),
        ]
        for i, (obj_type, cls, action, risk, reversible) in enumerate(MOD_EVENTS):
            meid = f"modev_{TENANT_ID}_{i}"
            if not exists(db, ModerationEvent, meid):
                db.add(ModerationEvent(id=meid, tenant_id=TENANT_ID,
                                       channel_account_id=ca_map["instagram"],
                                       external_object_id=f"ext_obj_{i}",
                                       object_type=obj_type, classification=cls,
                                       action_taken=action, risk_score=risk, reversible=reversible))
        db.commit()
        print("✓ Moderation Policies & Events")

        # ── 18. Integrations ──
        INTEGRATIONS = [
            ("hubspot", "crm", "connected"),
            ("google_ads", "ads", "connected"),
            ("slack", "automation", "connected"),
            ("zapier", "automation", "paused"),
        ]
        for i, (provider, typ, status) in enumerate(INTEGRATIONS):
            iid = f"int_{TENANT_ID}_{i}"
            if not exists(db, Integration, iid):
                db.add(Integration(id=iid, tenant_id=TENANT_ID, provider=provider,
                                   type=typ, status=status, config_json_encrypted="{}"))
        db.commit()
        print("✓ Integrations")

        # ── 19. Products & Commerce ──
        PRODUCTS = [
            ("Naboah Pulse — Starter", "Plano Starter com 2 agentes IA", 199, "NAB-STR"),
            ("Naboah Pulse — Pro", "Plano Pro com 5 agentes e BI avançado", 499, "NAB-PRO"),
            ("Naboah Pulse — Enterprise", "Plano Enterprise ilimitado", 1299, "NAB-ENT"),
            ("Add-on: Extra AI Agent", "Agente IA adicional", 99, "NAB-AIA"),
        ]
        for i, (name, desc, price, sku) in enumerate(PRODUCTS):
            pid = f"prod_{TENANT_ID}_{i}"
            if not exists(db, Product, pid):
                db.add(Product(id=pid, tenant_id=TENANT_ID, name=name, description=desc,
                               price=price, currency="BRL", sku=sku, stock_quantity=999, is_active=True))
        db.commit()

        # Orders
        for i in range(3):
            oid = f"order_{TENANT_ID}_{i}"
            if not exists(db, Order, oid):
                statuses = ["paid", "shipped", "pending_payment"]
                db.add(Order(id=oid, tenant_id=TENANT_ID, contact_id=contact_ids[i],
                             status=statuses[i], total_amount=PRODUCTS[i][2],
                             created_at=ago(days=i*3)))
                db.commit()
                db.add(OrderItem(id=f"oi_{TENANT_ID}_{i}", order_id=oid,
                                 product_id=f"prod_{TENANT_ID}_{i}", quantity=1,
                                 unit_price=PRODUCTS[i][2]))
                db.commit()
                db.add(PaymentTransaction(id=f"ptx_{TENANT_ID}_{i}", tenant_id=TENANT_ID,
                                          order_id=oid, provider=["stripe", "pix", "stripe"][i],
                                          amount=PRODUCTS[i][2],
                                          status=["succeeded", "succeeded", "pending"][i],
                                          provider_tx_id=f"tx_{uuid.uuid4().hex[:12]}"))
                db.commit()
        print("✓ Products, Orders, Payments")

        # ── 20. Supply Chain ──
        WAREHOUSES = [
            ("Depósito Central SP", {"lat": -23.55, "lng": -46.63, "address": "São Paulo, BR"}),
            ("Hub Porto", {"lat": 41.15, "lng": -8.61, "address": "Porto, PT"}),
            ("Miami Warehouse", {"lat": 25.76, "lng": -80.19, "address": "Miami, US"}),
        ]
        for i, (name, loc) in enumerate(WAREHOUSES):
            wid = f"wh_{TENANT_ID}_{i}"
            if not exists(db, Warehouse, wid):
                db.add(Warehouse(id=wid, tenant_id=TENANT_ID, name=name, location_json=loc))
        db.commit()

        SKUS = [
            ("Naboah Pulse Box", "Kit de boas-vindas físico", "7891234567890", 49.90),
            ("Branded USB Drive", "Pen drive com documentação", "7891234567891", 29.90),
            ("Training Manual", "Manual impresso de treinamento", "7891234567892", 19.90),
            ("Welcome Pack", "Pack completo de onboarding", "7891234567893", 89.90),
        ]
        for i, (name, desc, barcode, price) in enumerate(SKUS):
            sid = f"sku_{TENANT_ID}_{i}"
            if not exists(db, ProductSKU, sid):
                db.add(ProductSKU(id=sid, tenant_id=TENANT_ID, name=name, description=desc,
                                  barcode=barcode, base_price=price))
        db.commit()

        # Inventory movements
        for i in range(6):
            imid = f"inv_{TENANT_ID}_{i}"
            if not exists(db, InventoryMovement, imid):
                db.add(InventoryMovement(id=imid, sku_id=f"sku_{TENANT_ID}_{i % len(SKUS)}",
                                         warehouse_id=f"wh_{TENANT_ID}_{i % len(WAREHOUSES)}",
                                         quantity_change=random.choice([50, 100, -20, -10, 200, -5]),
                                         reason=random.choice(["restock", "sale", "return", "adjustment"]),
                                         created_at=ago(days=i)))
        db.commit()

        # Shipping orders
        for i in range(3):
            soid = f"ship_{TENANT_ID}_{i}"
            if not exists(db, ShippingOrder, soid):
                db.add(ShippingOrder(id=soid, tenant_id=TENANT_ID, order_id=f"order_{TENANT_ID}_{i}",
                                     tracking_number=f"BR{random.randint(100000, 999999)}",
                                     carrier_name=["Correios", "Fedex", "Loggi"][i],
                                     status=["delivered", "in_transit", "pending"][i],
                                     shipping_cost=round(random.uniform(15, 50), 2),
                                     estimated_delivery=datetime.utcnow() + timedelta(days=i+2)))
        db.commit()
        print("✓ Warehouses, SKUs, Inventory, Shipping")

        # ── 21. Community ──
        TOPICS = [
            ("Melhores práticas para automações", "Quero compartilhar algumas dicas sobre automações no Pulse...", "General"),
            ("Bug report: dashboard lento", "O dashboard está demorando 5s+ para carregar desde ontem.", "Q&A"),
            ("Sugestão: dark mode no mobile", "Seria ótimo ter dark mode no app mobile também!", "Announcements"),
        ]
        for i, (title, content, cat) in enumerate(TOPICS):
            ftid = f"topic_{TENANT_ID}_{i}"
            if not exists(db, ForumTopic, ftid):
                db.add(ForumTopic(id=ftid, tenant_id=TENANT_ID, author_id=USER_ID,
                                  title=title, content=content, category=cat,
                                  is_pinned=i == 0, created_at=ago(days=i*2)))
        db.commit()

        FEAT_REQUESTS = [
            ("Integração com Telegram", "Adicionar suporte nativo ao Telegram como canal", "planned", 42),
            ("API de Webhooks v2", "Nova versão da API com filtros de eventos", "under_review", 28),
            ("Export para Excel", "Exportar relatórios em formato .xlsx além de CSV", "open", 15),
        ]
        for i, (title, desc, status, votes) in enumerate(FEAT_REQUESTS):
            frid = f"freq_{TENANT_ID}_{i}"
            if not exists(db, FeatureRequest, frid):
                db.add(FeatureRequest(id=frid, tenant_id=TENANT_ID, author_id=USER_ID,
                                      title=title, description=desc, status=status, votes=votes))
        db.commit()
        print("✓ Community Topics, Feature Requests")

        # ── 22. Security & Compliance ──
        SEC_ALERTS = [
            ("brute_force", "high", "investigating", "Multiple failed login attempts from 185.23.xx.xx"),
            ("anomalous_access", "medium", "open", "Login from new location: Lagos, Nigeria"),
            ("data_leak_attempt", "critical", "resolved", "Attempted bulk export of contacts via API"),
        ]
        for i, (typ, sev, st, desc) in enumerate(SEC_ALERTS):
            said = f"secalert_{TENANT_ID}_{i}"
            if not exists(db, SecurityAlert, said):
                db.add(SecurityAlert(id=said, tenant_id=TENANT_ID, type=typ, severity=sev,
                                     status=st, description=desc,
                                     metadata_json={"ip": f"185.23.{random.randint(1,255)}.{random.randint(1,255)}"}))
        db.commit()

        DLP_POLICIES = [
            ("Mask Credit Cards", "regex", "mask"),
            ("Block CPF Export", "ai_entity", "block"),
        ]
        for i, (name, ptype, action) in enumerate(DLP_POLICIES):
            did = f"dlp_{TENANT_ID}_{i}"
            if not exists(db, DLPPolicy, did):
                db.add(DLPPolicy(id=did, tenant_id=TENANT_ID, name=name,
                                 pattern_type=ptype, action=action, is_enabled=True))
        db.commit()

        # Audit Sessions
        for i in range(2):
            asid = f"audsess_{TENANT_ID}_{i}"
            if not exists(db, AuditSession, asid):
                db.add(AuditSession(id=asid, tenant_id=TENANT_ID, user_id=USER_ID,
                                    ip_address=f"192.168.1.{10+i}", user_agent="Mozilla/5.0 Chrome/120",
                                    activity_log_json=[
                                        {"action": "login", "timestamp": ago(hours=i*5).isoformat()},
                                        {"action": "view_dashboard", "timestamp": ago(hours=i*5-1).isoformat()},
                                    ],
                                    started_at=ago(hours=i*5)))
        db.commit()

        # Audit Logs
        AUDIT_ENTRIES = [
            ("user", USER_ID, "login", "session", f"audsess_{TENANT_ID}_0"),
            ("agent", "ag_support", "resolve_ticket", "ticket", f"tick_{TENANT_ID}_0"),
            ("system", "system", "backup_complete", "system", "backup_001"),
        ]
        for i, (actor_type, actor_id, action, entity_type, entity_id) in enumerate(AUDIT_ENTRIES):
            alid = i + 1  # Auto-increment
            db.add(AuditLog(tenant_id=TENANT_ID, actor_type=actor_type, actor_id=actor_id,
                            action=action, entity_type=entity_type, entity_id=entity_id,
                            created_at=ago(hours=i*2)))
        try:
            db.commit()
        except Exception:
            db.rollback()
        print("✓ Security Alerts, DLP, Audit")

        # ── 23. Knowledge Base (Neural) ──
        KNOWLEDGE_SOURCES = [
            ("Manual de Reembolso v2", "file", "active"),
            ("FAQ Website", "url", "active"),
            ("Documentação API", "url", "active"),
        ]
        for i, (name, stype, status) in enumerate(KNOWLEDGE_SOURCES):
            ksid = f"ksrc_{TENANT_ID}_{i}"
            if not exists(db, KnowledgeSource, ksid):
                db.add(KnowledgeSource(id=ksid, tenant_id=TENANT_ID, name=name,
                                       source_type=stype, status=status,
                                       metadata_json={"chunks": random.randint(50, 200), "tokens": random.randint(10000, 50000)}))
        db.commit()

        # Knowledge Chunks
        CHUNKS = [
            ("O prazo para reembolso é de 7 dias úteis após a solicitação.", 0),
            ("Para solicitar reembolso, acesse Configurações > Billing > Solicitar Reembolso.", 0),
            ("A API suporta autenticação via Bearer Token e API Key.", 2),
            ("Endpoints disponíveis: /conversations, /contacts, /deals, /tickets.", 2),
            ("Para integrar WhatsApp, é necessário ter uma conta Meta Business verificada.", 1),
            ("O tempo médio de resposta do suporte é de 2 horas para prioridade alta.", 1),
        ]
        for i, (content, src_idx) in enumerate(CHUNKS):
            kcid = f"kchunk_{TENANT_ID}_{i}"
            if not exists(db, KnowledgeChunk, kcid):
                db.add(KnowledgeChunk(id=kcid, source_id=f"ksrc_{TENANT_ID}_{src_idx}",
                                      content=content, tokens=len(content.split()),
                                      metadata_json={"page": i+1}))
        db.commit()
        print("✓ Knowledge Sources & Chunks")

        # ── 24. Widgets ──
        WIDGETS = [
            ("Website Chat Principal", "#7B61FF", "#10B981", "Olá! Como posso ajudar?", True, "ag_support"),
            ("Landing Page Chat", "#4F46E5", "#F59E0B", "Quer saber mais sobre o Pulse?", True, "ag_sales"),
        ]
        for i, (name, primary, accent, welcome, active, agent) in enumerate(WIDGETS):
            wid = f"widget_{TENANT_ID}_{i}"
            if not exists(db, WidgetConfig, wid):
                db.add(WidgetConfig(id=wid, tenant_id=TENANT_ID, name=name,
                                    primary_color=primary, accent_color=accent,
                                    welcome_message=welcome, is_active=active,
                                    agent_id=agent, collect_email=True,
                                    allowed_domains_json=["naboah.com", "naboahpulse.vercel.app"]))
        db.commit()
        print("✓ Widgets")

        # ── 25. Synergy ──
        room_id = f"room_{TENANT_ID}_0"
        if not exists(db, SynergyRoom, room_id):
            db.add(SynergyRoom(id=room_id, tenant_id=TENANT_ID, name="Brainstorm — Q1 Strategy",
                                type="canvas", created_by_id=USER_ID, is_active=True))
            db.commit()
            # Canvas elements
            elements = [
                ("sticky", {"text": "Aumentar retenção em 15%", "color": "yellow", "x": 100, "y": 100}),
                ("sticky", {"text": "Lançar integração Telegram", "color": "blue", "x": 300, "y": 100}),
                ("text", {"text": "Prioridade: Growth → Retention → Expansion", "x": 200, "y": 300}),
            ]
            for j, (etype, content) in enumerate(elements):
                db.add(CanvasElement(id=f"elem_{TENANT_ID}_{j}", room_id=room_id,
                                     type=etype, content_json=content, last_modified_by_id=USER_ID))
            # Sticky notes
            db.add(StickyNote(id=f"sticky_{TENANT_ID}_0", tenant_id=TENANT_ID,
                              context_type="canvas", context_id=room_id,
                              content="Discutir com equipe de produto", color="green",
                              author_id=USER_ID, position_json={"x": 500, "y": 200}))
            db.commit()
        print("✓ Synergy Rooms & Canvas")

        # ── 26. Region Health ──
        REGIONS = [
            ("sa-east-1", "operational", 24, 45.2),
            ("us-east-1", "operational", 84, 62.8),
            ("eu-west-1", "operational", 42, 38.5),
            ("ap-southeast-1", "degraded", 156, 78.9),
        ]
        for i, (name, status, latency, load) in enumerate(REGIONS):
            rid = f"region_{i}"
            if not exists(db, RegionHealth, rid):
                db.add(RegionHealth(id=rid, region_name=name, status=status,
                                    latency_ms=latency, load_percentage=load))
        db.commit()
        print("✓ Region Health")

        # ── 27. Tax Rules ──
        TAX_RULES = [
            ("BR", "São Paulo", "ICMS", 0.18),
            ("PT", None, "IVA", 0.23),
            ("US", "California", "Sales Tax", 0.0725),
        ]
        for i, (country, region, name, rate) in enumerate(TAX_RULES):
            trid = f"tax_{TENANT_ID}_{i}"
            if not exists(db, RegionalTaxRule, trid):
                db.add(RegionalTaxRule(id=trid, tenant_id=TENANT_ID, country_code=country,
                                       region_name=region, tax_name=name, tax_rate=rate))
        db.commit()
        print("✓ Tax Rules")

        # ── 28. Billing ──
        PLANS = [
            ("plan_free", "Free", 0, 0, 1, 1, 500),
            ("plan_starter", "Starter", 99, 79, 1, 2, 5000),
            ("plan_pro", "Pro", 499, 399, 3, 5, 50000),
            ("plan_enterprise", "Enterprise", 1299, 999, 10, 20, 500000),
        ]
        for pid, name, monthly, yearly, tenants, agents, msgs in PLANS:
            if not exists(db, SubscriptionPlan, pid):
                db.add(SubscriptionPlan(id=pid, name=name, price_monthly=monthly, price_yearly=yearly,
                                        max_tenants=tenants, max_agents=agents,
                                        max_messages_monthly=msgs, is_active=True,
                                        features_json={"analytics": True, "api": monthly >= 499, "sso": monthly >= 1299}))
        db.commit()

        quota_id = f"quota_{TENANT_ID}"
        if not exists(db, UsageQuota, quota_id):
            db.add(UsageQuota(id=quota_id, tenant_id=TENANT_ID, plan_id="plan_pro",
                              current_period_start=datetime(2026, 3, 1),
                              current_period_end=datetime(2026, 3, 31),
                              messages_sent=2847, ai_credits_remaining=450.0, status="active"))
        db.commit()

        CREDIT_TXS = [
            (500, "purchase", "Compra de 500 créditos AI"),
            (-32, "usage", "Geração de conteúdo — 3 posts"),
            (-18, "usage", "Análise de sentimento — 50 mensagens"),
            (100, "purchase", "Top-up de créditos"),
            (-45, "usage", "Avatar video rendering"),
        ]
        for i, (amount, typ, desc) in enumerate(CREDIT_TXS):
            ctid = f"ctx_{TENANT_ID}_{i}"
            if not exists(db, CreditTransaction, ctid):
                db.add(CreditTransaction(id=ctid, tenant_id=TENANT_ID, amount=amount,
                                         type=typ, description=desc, created_at=ago(days=i*2)))
        db.commit()
        print("✓ Billing Plans, Quota, Credits")

        # ── 29. Business Forecasts ──
        FORECASTS = [
            ("revenue", 45000, 0.85, {"trend": "up", "driver": "enterprise_deals"}),
            ("revenue", 52000, 0.78, {"trend": "up", "driver": "new_signups"}),
            ("churn", 2.1, 0.72, {"risk_segment": "starter_plan", "action": "retention_campaign"}),
            ("churn", 1.8, 0.68, {"risk_segment": "free_trial", "action": "onboarding_improvement"}),
            ("growth", 15.5, 0.81, {"channel": "organic", "driver": "content_marketing"}),
            ("growth", 22.3, 0.74, {"channel": "paid", "driver": "meta_campaigns"}),
        ]
        for i, (typ, val, conf, insights) in enumerate(FORECASTS):
            fid = f"forecast_{TENANT_ID}_{i}"
            if not exists(db, BusinessForecast, fid):
                db.add(BusinessForecast(id=fid, tenant_id=TENANT_ID, type=typ,
                                        period_start=datetime(2026, 3, 1),
                                        period_end=datetime(2026, 3, 31),
                                        predicted_value=val, confidence_score=conf,
                                        insights_json=insights))
        db.commit()

        # Strategy Scenarios
        SCENARIOS = [
            ("Aumento de 10% no preço Pro", {"price_change": 0.10, "churn_impact": 0.02}, 55000, 0.72),
            ("Expansão para LATAM", {"markets": ["MX", "CO", "AR"], "investment": 100000}, 180000, 0.65),
            ("Free tier removal", {"action": "convert_or_churn", "estimated_conversion": 0.15}, 38000, 0.58),
        ]
        for i, (name, params, revenue, conf) in enumerate(SCENARIOS):
            ssid = f"scenario_{TENANT_ID}_{i}"
            if not exists(db, StrategyScenario, ssid):
                db.add(StrategyScenario(id=ssid, tenant_id=TENANT_ID, name=name,
                                        parameters_json=params, projected_revenue=revenue,
                                        confidence_score=conf))
        db.commit()

        # Analysis Narratives
        NARRATIVES = [
            ("2026-03", "<h2>Março 2026 — Executive Summary</h2><p>Revenue cresceu 18% MoM...</p>",
             {"mrr": 45000, "arr": 540000, "churn": 2.1, "nps": 72}),
            ("2026-02", "<h2>Fevereiro 2026</h2><p>Foco em retenção resultou em queda de churn...</p>",
             {"mrr": 38000, "arr": 456000, "churn": 3.2, "nps": 68}),
        ]
        for i, (period, html, metrics) in enumerate(NARRATIVES):
            anid = f"narrative_{TENANT_ID}_{i}"
            if not exists(db, AnalysisNarrative, anid):
                db.add(AnalysisNarrative(id=anid, tenant_id=TENANT_ID, period=period,
                                         narrative_html=html, key_metrics_json=metrics))
        db.commit()
        print("✓ Forecasts, Scenarios, Narratives")

        # ── 30. Apps & Marketplace ──
        APPS = [
            ("HubSpot CRM Sync", "Sincronize contatos e deals com HubSpot", "HubSpot", "CRM", True),
            ("Slack Notifications", "Receba notificações do Pulse no Slack", "Naboah", "Automation", True),
            ("Google Analytics", "Conecte GA4 para insights avançados", "Google", "Analytics", False),
            ("Zapier Integration", "Conecte 5000+ apps via Zapier", "Zapier", "Automation", False),
        ]
        for i, (name, desc, dev, cat, official) in enumerate(APPS):
            appid = f"app_{i}"
            if not exists(db, App, appid):
                db.add(App(id=appid, name=name, description=desc, developer_name=dev,
                           category=cat, is_official=official, is_public=True))
        db.commit()

        # App Installations
        for i in range(2):
            aiid = f"appinst_{TENANT_ID}_{i}"
            if not exists(db, AppInstallation, aiid):
                db.add(AppInstallation(id=aiid, tenant_id=TENANT_ID, app_id=f"app_{i}",
                                       installed_by_id=USER_ID, is_enabled=True))
        db.commit()
        print("✓ Marketplace Apps & Installations")

        # ── 31. Developer Apps ──
        DEV_APPS = [
            ("Naboah Mobile App", "App mobile oficial", "naboah_mobile_001", "development"),
            ("Custom CRM Widget", "Widget customizado para CRM", "custom_crm_001", "published"),
        ]
        for i, (name, desc, client_id, status) in enumerate(DEV_APPS):
            daid = f"devapp_{TENANT_ID}_{i}"
            if not exists(db, DeveloperApp, daid):
                db.add(DeveloperApp(id=daid, tenant_id=TENANT_ID, name=name, description=desc,
                                    client_id=client_id, client_secret_hash=hashlib.sha256(b"secret").hexdigest(),
                                    redirect_uris="https://app.naboah.com/callback", status=status))
        db.commit()

        # App Versions
        for i in range(2):
            avid = f"appver_{TENANT_ID}_{i}"
            if not exists(db, AppVersion, avid):
                db.add(AppVersion(id=avid, app_id=f"devapp_{TENANT_ID}_{i}",
                                  version_string=f"1.{i}.0", changelog=f"Release v1.{i}.0",
                                  manifest_json={"permissions": ["read:contacts", "write:messages"]}))
        db.commit()

        # Webhook Logs
        for i in range(3):
            wlid = f"whlog_{TENANT_ID}_{i}"
            if not exists(db, WebhookLog, wlid):
                db.add(WebhookLog(id=wlid, app_id=f"devapp_{TENANT_ID}_0",
                                  event_type=["message.received", "lead.created", "deal.updated"][i],
                                  payload_json={"event": f"test_{i}"}, response_code=200,
                                  created_at=ago(hours=i*3)))
        db.commit()
        print("✓ Developer Apps, Versions, Webhook Logs")

        # ── 32. API Keys ──
        for i, (name, scopes) in enumerate([("Zapier Integration", "read,write"), ("Analytics Dashboard", "read")]):
            akid = f"apikey_{TENANT_ID}_{i}"
            if not exists(db, APIKey, akid):
                db.add(APIKey(id=akid, tenant_id=TENANT_ID,
                              key_hash=hashlib.sha256(f"key_{i}".encode()).hexdigest(),
                              name=name, scopes=scopes, is_active=True))
        db.commit()
        print("✓ API Keys")

        # ── 33. Voice / Calls ──
        CALLS = [
            ("+5511991234567", "+5511900000001", "inbound", 180, "completed", "Cliente pediu demo do produto."),
            ("+5511900000001", "+5521998765432", "outbound", 300, "completed", "Follow-up comercial. Cliente interessado no Enterprise."),
            ("+5531987654321", "+5511900000001", "inbound", 0, "missed", None),
        ]
        for i, (from_n, to_n, direction, dur, status, summary) in enumerate(CALLS):
            crid = f"call_{TENANT_ID}_{i}"
            if not exists(db, CallRecord, crid):
                db.add(CallRecord(id=crid, tenant_id=TENANT_ID, from_number=from_n, to_number=to_n,
                                  direction=direction, duration_seconds=dur, status=status,
                                  summary=summary, sentiment_score=0.7 if summary else None,
                                  created_at=ago(days=i)))
        db.commit()

        # Voicemail
        vmid = f"vm_{TENANT_ID}_0"
        if not exists(db, Voicemail, vmid):
            db.add(Voicemail(id=vmid, tenant_id=TENANT_ID, call_record_id=f"call_{TENANT_ID}_2",
                             audio_url="https://storage.naboah.com/voicemail_001.mp3",
                             transcription="Olá, tentei ligar mas não consegui. Retornem quando possível.",
                             is_read=False))
        db.commit()
        print("✓ Calls & Voicemails")

        # ── 34. User Devices ──
        devid = f"device_{TENANT_ID}_0"
        if not exists(db, UserDevice, devid):
            db.add(UserDevice(id=devid, user_id=USER_ID, tenant_id=TENANT_ID,
                              device_name="MacBook Pro de Rodrigo", os_type="macos",
                              app_version="1.2.0", is_native=True, global_shortcut_enabled=True))
        db.commit()
        print("✓ User Devices")

        # ── 35. AI Cost Logs ──
        COSTS = [
            ("anthropic", "claude-3-sonnet", 1500, 0, 0.012),
            ("anthropic", "claude-3-sonnet", 2200, 0, 0.018),
            ("openai", "dall-e-3", 0, 1024000, 0.04),
            ("elevenlabs", "eleven-turbo-v2", 0, 0, 0.025),
            ("anthropic", "claude-3-opus", 5000, 0, 0.075),
        ]
        for i, (provider, model, tokens, pixels, cost) in enumerate(COSTS):
            acid = f"aicost_{TENANT_ID}_{i}"
            if not exists(db, AICostLog, acid):
                db.add(AICostLog(id=acid, tenant_id=TENANT_ID, provider=provider,
                                 model_name=model, tokens_used=tokens, pixels_generated=pixels,
                                 estimated_cost_usd=cost, created_at=ago(days=i)))
        db.commit()

        # Asset Audit Log
        for i in range(3):
            aalid = f"assetaudit_{TENANT_ID}_{i}"
            if not exists(db, AssetAuditLog, aalid):
                db.add(AssetAuditLog(id=aalid, tenant_id=TENANT_ID,
                                     asset_id=f"media_{TENANT_ID}_{i}",
                                     user_id=USER_ID,
                                     action=["create", "modify", "approve"][i],
                                     previous_state_json={}, new_state_json={"qa_status": "approved"},
                                     created_at=ago(days=i)))
        db.commit()

        # Asset Backup Config
        bkid = f"backup_{TENANT_ID}"
        if not exists(db, AssetBackupConfig, bkid):
            db.add(AssetBackupConfig(id=bkid, tenant_id=TENANT_ID, provider="s3",
                                     region="sa-east-1", bucket_name="naboah-pulse-backups",
                                     replication_enabled=True, retention_days=365,
                                     last_backup_at=ago(hours=6)))
        db.commit()
        print("✓ AI Costs, Asset Audit, Backups")

        # ── 36. Audit Stream Config ──
        ascid = f"audstream_{TENANT_ID}"
        if not exists(db, AuditStreamConfig, ascid):
            db.add(AuditStreamConfig(id=ascid, tenant_id=TENANT_ID,
                                     destination_url="https://siem.naboah.com/events",
                                     auth_header="Bearer siem_token_xxx", is_active=True,
                                     event_filters="login,data_export,permission_change"))
        db.commit()

        # ── 37. UI State ──
        uisid = f"uistate_{TENANT_ID}_0"
        if not exists(db, UIState, uisid):
            db.add(UIState(id=uisid, tenant_id=TENANT_ID, user_id=USER_ID,
                           context_key="dashboard_main",
                           layout_json={"sidebar_collapsed": False, "theme": "dark"},
                           widgets_json=[
                               {"type": "kpi", "title": "MRR", "position": {"x": 0, "y": 0}},
                               {"type": "chart", "title": "Messages/Day", "position": {"x": 1, "y": 0}},
                           ]))
        db.commit()

        # Intake Items
        INTAKE = [
            ("whatsapp", "audio", "content", "Áudio do cliente pedindo post para Instagram"),
            ("telegram", "pdf", "ads", "PDF com briefing de campanha Q1"),
            ("upload", "xlsx", "ops", "Planilha de contatos para importação"),
        ]
        for i, (src, ftype, intent, text) in enumerate(INTAKE):
            iiid = f"intake_{TENANT_ID}_{i}"
            if not exists(db, IntakeItem, iiid):
                db.add(IntakeItem(id=iiid, tenant_id=TENANT_ID, source_type=src,
                                  file_type=ftype, intent=intent, text_content=text,
                                  status="processed" if i < 2 else "pending"))
        db.commit()
        print("✓ UI State, Intake Items, Audit Stream")

        # ── 38. Prompt Artifacts ──
        for i in range(3):
            paid = f"prompt_{TENANT_ID}_{i}"
            if not exists(db, PromptArtifact, paid):
                db.add(PromptArtifact(id=paid, tenant_id=TENANT_ID,
                                      prompt_type=["text_to_image", "text_to_video", "music_gen"][i],
                                      model_provider=["openai", "runaway", "openai"][i],
                                      model_name=["dall-e-3", "gen-3", "jukebox"][i],
                                      prompt_text=f"Generate a {['hero image', 'product demo', 'jingle'][i]} for Naboah Pulse",
                                      qa_status="approved", risk_score=0.05))
        db.commit()

        # Creative Jobs & Job Runs
        for i in range(2):
            cjid = f"cjob_{TENANT_ID}_{i}"
            if not exists(db, CreativeJob, cjid):
                db.add(CreativeJob(id=cjid, tenant_id=TENANT_ID,
                                   intake_item_id=f"intake_{TENANT_ID}_{i}",
                                   job_type=["social_post", "ad_campaign"][i],
                                   persona_profile_id=f"persona_{TENANT_ID}_{i}",
                                   knowledge_pack_id=f"kpack_{TENANT_ID}_{i}",
                                   status="completed"))
                db.commit()
                db.add(JobRun(id=f"jrun_{TENANT_ID}_{i}", tenant_id=TENANT_ID,
                              creative_job_id=cjid, pipeline_name="content_pipeline_v2",
                              output_summary=f"Generated {['3 post variants', '2 ad creatives'][i]}",
                              cost_usage_json={"tokens": 1500, "cost_usd": 0.02},
                              status="success", started_at=ago(hours=i+1),
                              finished_at=ago(hours=i)))
                db.commit()
        print("✓ Prompts, Creative Jobs, Job Runs")

        # ── Done ──
        print("\n" + "=" * 50)
        print("  ✅ FULL SEED COMPLETE!")
        print("=" * 50)
        print(f"  Tenant: {TENANT_ID}")
        print(f"  Tables seeded: 50+")
        print(f"  Ready for all 41 pages")
        print("=" * 50)


if __name__ == "__main__":
    seed()
