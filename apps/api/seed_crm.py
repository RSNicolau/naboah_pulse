"""
Seed script for CRM tables — realistic data for tenant "naboah"
"""
import sys
sys.path.insert(0, ".")

from db import engine, init_db
from sqlmodel import Session, select
from models_crm import (
    CRMContact, CRMCompany, CRMContactCompany,
    CRMPipeline, CRMStage, CRMDeal,
    CRMActivity, CRMTicket, CRMOrder,
    CRMSegment, CRMRFMSnapshot,
    RepediuConnection,
    AICenter, CRMRole, CRMMembership, CRMAuditLog,
    AutonomyPolicy, CostBudget,
    CRMCampaign,
)
from datetime import datetime, timedelta
import uuid

TENANT = "naboah"

def seed():
    init_db()
    with Session(engine) as db:
        # Check if already seeded
        existing = db.exec(select(CRMContact).where(CRMContact.tenant_id == TENANT)).first()
        if existing:
            print("CRM already seeded, skipping.")
            return

        print("Seeding CRM data...")

        # ── CONTACTS ──
        contacts = [
            CRMContact(id="cnt_001", tenant_id=TENANT, first_name="Ana", last_name="Silva", phone_e164="+5511987654321", email="ana@empresa.com.br", lifecycle_stage="customer", lead_score=85, health_score=92.0, predicted_ltv=4500.0, churn_risk_level="low", tags_json=["vip", "recorrente"], last_purchase_at=datetime.utcnow() - timedelta(days=3), last_activity_at=datetime.utcnow() - timedelta(hours=2)),
            CRMContact(id="cnt_002", tenant_id=TENANT, first_name="Carlos", last_name="Oliveira", phone_e164="+5521976543210", email="carlos@startup.io", lifecycle_stage="prospect", lead_score=62, health_score=78.0, predicted_ltv=2200.0, churn_risk_level="low", tags_json=["b2b", "saas"], last_activity_at=datetime.utcnow() - timedelta(days=1)),
            CRMContact(id="cnt_003", tenant_id=TENANT, first_name="Mariana", last_name="Costa", phone_e164="+5531965432109", email="mariana@loja.com", lifecycle_stage="customer", lead_score=91, health_score=95.0, predicted_ltv=8200.0, churn_risk_level="low", tags_json=["enterprise", "vip"], last_purchase_at=datetime.utcnow() - timedelta(days=7), last_activity_at=datetime.utcnow() - timedelta(hours=6)),
            CRMContact(id="cnt_004", tenant_id=TENANT, first_name="Pedro", last_name="Santos", phone_e164="+5541954321098", email="pedro@delivery.com.br", lifecycle_stage="churn_risk", lead_score=35, health_score=42.0, predicted_ltv=900.0, churn_risk_level="high", tags_json=["delivery", "repediu"], last_purchase_at=datetime.utcnow() - timedelta(days=45), last_activity_at=datetime.utcnow() - timedelta(days=30)),
            CRMContact(id="cnt_005", tenant_id=TENANT, first_name="Juliana", last_name="Ferreira", phone_e164="+5511943210987", email="juliana@agencia.com", lifecycle_stage="lead", lead_score=48, health_score=70.0, predicted_ltv=1500.0, churn_risk_level="medium", tags_json=["inbound", "marketing"]),
            CRMContact(id="cnt_006", tenant_id=TENANT, first_name="Rafael", last_name="Lima", phone_e164="+5521932109876", email="rafael@tech.io", lifecycle_stage="customer", lead_score=75, health_score=88.0, predicted_ltv=3800.0, churn_risk_level="low", tags_json=["tech", "api-user"], last_purchase_at=datetime.utcnow() - timedelta(days=12), last_activity_at=datetime.utcnow() - timedelta(days=2)),
            CRMContact(id="cnt_007", tenant_id=TENANT, first_name="Beatriz", last_name="Almeida", phone_e164="+5531921098765", email="bia@restaurante.com.br", lifecycle_stage="customer", lead_score=68, health_score=82.0, predicted_ltv=2900.0, churn_risk_level="low", tags_json=["food", "repediu", "recorrente"], last_purchase_at=datetime.utcnow() - timedelta(days=2), last_activity_at=datetime.utcnow() - timedelta(hours=12)),
            CRMContact(id="cnt_008", tenant_id=TENANT, first_name="Lucas", last_name="Pereira", phone_e164="+5541910987654", email="lucas@ecommerce.com", lifecycle_stage="prospect", lead_score=55, health_score=65.0, predicted_ltv=1800.0, churn_risk_level="medium", tags_json=["ecommerce", "trial"]),
        ]
        for c in contacts:
            db.add(c)

        # ── COMPANIES ──
        companies = [
            CRMCompany(id="cmp_001", tenant_id=TENANT, name="TechStart Ltda", domain="startup.io", document_id="12.345.678/0001-90", tags_json=["saas", "b2b"], health_score=85.0),
            CRMCompany(id="cmp_002", tenant_id=TENANT, name="Restaurante Sabor & Arte", domain="restaurantesa.com.br", document_id="98.765.432/0001-10", tags_json=["food", "delivery"], health_score=90.0),
            CRMCompany(id="cmp_003", tenant_id=TENANT, name="Agência Digital Plus", domain="agencia.com", document_id="11.222.333/0001-44", tags_json=["agency", "marketing"], health_score=72.0),
        ]
        for c in companies:
            db.add(c)

        # ── CONTACT-COMPANY ──
        db.add(CRMContactCompany(id="cc_001", tenant_id=TENANT, contact_id="cnt_002", company_id="cmp_001", role_title="CTO"))
        db.add(CRMContactCompany(id="cc_002", tenant_id=TENANT, contact_id="cnt_007", company_id="cmp_002", role_title="Proprietária"))
        db.add(CRMContactCompany(id="cc_003", tenant_id=TENANT, contact_id="cnt_005", company_id="cmp_003", role_title="Diretora de Marketing"))

        # ── PIPELINE ──
        pipeline = CRMPipeline(id="pip_001", tenant_id=TENANT, name="Sales Pipeline", is_default=True)
        db.add(pipeline)

        stages = [
            CRMStage(id="stg_001", tenant_id=TENANT, pipeline_id="pip_001", name="Prospecção", order_index=0, probability=0.1, color="#6366F1"),
            CRMStage(id="stg_002", tenant_id=TENANT, pipeline_id="pip_001", name="Qualificação", order_index=1, probability=0.25, sla_hours=48, color="#8B5CF6"),
            CRMStage(id="stg_003", tenant_id=TENANT, pipeline_id="pip_001", name="Proposta", order_index=2, probability=0.5, sla_hours=72, color="#A78BFA"),
            CRMStage(id="stg_004", tenant_id=TENANT, pipeline_id="pip_001", name="Negociação", order_index=3, probability=0.75, sla_hours=96, color="#C4B5FD"),
            CRMStage(id="stg_005", tenant_id=TENANT, pipeline_id="pip_001", name="Fechado (Ganho)", order_index=4, probability=1.0, is_won=True, color="#10B981"),
            CRMStage(id="stg_006", tenant_id=TENANT, pipeline_id="pip_001", name="Perdido", order_index=5, probability=0.0, is_lost=True, color="#EF4444"),
        ]
        for s in stages:
            db.add(s)

        # ── DEALS ──
        deals = [
            CRMDeal(id="deal_001", tenant_id=TENANT, pipeline_id="pip_001", stage_id="stg_003", contact_id="cnt_002", company_id="cmp_001", title="Plano Enterprise TechStart", value_cents=1500000, source="inbound", lead_score=72),
            CRMDeal(id="deal_002", tenant_id=TENANT, pipeline_id="pip_001", stage_id="stg_002", contact_id="cnt_005", company_id="cmp_003", title="Pacote Marketing Agência Plus", value_cents=450000, source="campaign", lead_score=55),
            CRMDeal(id="deal_003", tenant_id=TENANT, pipeline_id="pip_001", stage_id="stg_004", contact_id="cnt_001", title="Upgrade Ana Silva — Pro Annual", value_cents=288000, source="inbox", lead_score=88),
            CRMDeal(id="deal_004", tenant_id=TENANT, pipeline_id="pip_001", stage_id="stg_001", contact_id="cnt_008", title="Trial → Paid eCommerce", value_cents=120000, source="manual", lead_score=42),
            CRMDeal(id="deal_005", tenant_id=TENANT, pipeline_id="pip_001", stage_id="stg_005", contact_id="cnt_003", title="Mariana Costa — Enterprise Renewal", value_cents=960000, source="inbox", lead_score=95, status="won", closed_at=datetime.utcnow() - timedelta(days=15)),
            CRMDeal(id="deal_006", tenant_id=TENANT, pipeline_id="pip_001", stage_id="stg_006", contact_id="cnt_004", title="Pedro Santos — Reativação", value_cents=60000, source="campaign", lead_score=25, status="lost", closed_at=datetime.utcnow() - timedelta(days=20)),
        ]
        for d in deals:
            db.add(d)

        # ── ACTIVITIES ──
        activities = [
            CRMActivity(id="act_001", tenant_id=TENANT, type="call", contact_id="cnt_001", subject="Follow-up pós-upgrade", body="Discutir novas funcionalidades do plano Pro", due_at=datetime.utcnow() + timedelta(days=1), status="pending", priority="high"),
            CRMActivity(id="act_002", tenant_id=TENANT, type="meeting", contact_id="cnt_002", deal_id="deal_001", subject="Demo Enterprise para TechStart", body="Apresentar dashboard customizado e API", due_at=datetime.utcnow() + timedelta(days=3), status="pending", priority="high"),
            CRMActivity(id="act_003", tenant_id=TENANT, type="task", contact_id="cnt_004", subject="Enviar campanha de reativação", body="Pedro não compra há 45 dias — sequência WhatsApp", due_at=datetime.utcnow() + timedelta(hours=4), status="in_progress", priority="urgent"),
            CRMActivity(id="act_004", tenant_id=TENANT, type="note", contact_id="cnt_003", deal_id="deal_005", subject="Renovação confirmada", body="Mariana confirmou renovação Enterprise por mais 12 meses. Valor: R$ 9.600/ano", status="completed", completed_at=datetime.utcnow() - timedelta(days=15)),
            CRMActivity(id="act_005", tenant_id=TENANT, type="follow_up", contact_id="cnt_005", deal_id="deal_002", subject="Enviar proposta revisada", body="Ajustar pacote marketing conforme feedback", due_at=datetime.utcnow() + timedelta(days=2), status="pending", priority="medium"),
            CRMActivity(id="act_006", tenant_id=TENANT, type="msg", contact_id="cnt_007", channel="whatsapp", subject="Confirmação de pedido", body="Enviada confirmação do pedido #1847 via WhatsApp", status="completed", completed_at=datetime.utcnow() - timedelta(hours=6)),
            CRMActivity(id="act_007", tenant_id=TENANT, type="call", contact_id="cnt_006", subject="Onboarding API", body="Guiar Rafael na integração da API do Pulse", due_at=datetime.utcnow() + timedelta(days=5), status="pending", priority="medium"),
            CRMActivity(id="act_008", tenant_id=TENANT, type="task", subject="Revisar segmentação RFM", body="Atualizar segmentos de clientes com dados do último mês", due_at=datetime.utcnow() + timedelta(days=1), status="pending", priority="low"),
        ]
        for a in activities:
            db.add(a)

        # ── TICKETS ──
        tickets = [
            CRMTicket(id="tkt_001", tenant_id=TENANT, contact_id="cnt_004", category="billing", priority="high", status="open", summary="Cobrança duplicada no mês anterior", details="Pedro reporta que foi cobrado 2x no cartão em fevereiro", sla_due_at=datetime.utcnow() + timedelta(hours=12)),
            CRMTicket(id="tkt_002", tenant_id=TENANT, contact_id="cnt_001", category="support", priority="medium", status="pending", summary="Integração WhatsApp não sincroniza", details="Ana reporta que mensagens do WhatsApp Business não aparecem no inbox", sla_due_at=datetime.utcnow() + timedelta(hours=24)),
            CRMTicket(id="tkt_003", tenant_id=TENANT, contact_id="cnt_007", category="feature", priority="low", status="open", summary="Sugestão: relatório de vendas por dia da semana", details="Beatriz quer ver performance de vendas segmentada por dia"),
            CRMTicket(id="tkt_004", tenant_id=TENANT, contact_id="cnt_006", deal_id="deal_001", category="technical", priority="urgent", status="open", summary="API retornando 500 no endpoint /deals", details="Rafael encontrou erro ao tentar criar deals via API", sla_due_at=datetime.utcnow() + timedelta(hours=4)),
        ]
        for t in tickets:
            db.add(t)

        # ── ORDERS ──
        orders = [
            CRMOrder(id="ord_001", tenant_id=TENANT, provider="repediu", contact_id="cnt_007", external_order_id="REP-1847", total_cents=8950, items_json=[{"name": "Pizza Margherita", "qty": 2, "price": 3500}, {"name": "Refrigerante 2L", "qty": 1, "price": 1200}, {"name": "Tiramisù", "qty": 1, "price": 750}], channel="ifood", ordered_at=datetime.utcnow() - timedelta(hours=6)),
            CRMOrder(id="ord_002", tenant_id=TENANT, provider="repediu", contact_id="cnt_007", external_order_id="REP-1832", total_cents=5600, items_json=[{"name": "Lasanha Bolonhesa", "qty": 1, "price": 4200}, {"name": "Suco Natural", "qty": 1, "price": 1400}], channel="whatsapp", ordered_at=datetime.utcnow() - timedelta(days=3)),
            CRMOrder(id="ord_003", tenant_id=TENANT, provider="manual", contact_id="cnt_001", total_cents=288000, items_json=[{"name": "Plano Pro Anual", "qty": 1, "price": 288000}], channel="email", ordered_at=datetime.utcnow() - timedelta(days=10)),
            CRMOrder(id="ord_004", tenant_id=TENANT, provider="repediu", contact_id="cnt_004", external_order_id="REP-1790", total_cents=3200, items_json=[{"name": "Hambúrguer Artesanal", "qty": 1, "price": 2800}, {"name": "Batata Frita", "qty": 1, "price": 400}], channel="ifood", ordered_at=datetime.utcnow() - timedelta(days=45)),
        ]
        for o in orders:
            db.add(o)

        # ── SEGMENTS ──
        segments = [
            CRMSegment(id="seg_001", tenant_id=TENANT, name="VIP Customers", rules_json={"lifecycle_stage": "customer", "min_lead_score": 70}, contact_count=4, is_dynamic=True, last_computed_at=datetime.utcnow()),
            CRMSegment(id="seg_002", tenant_id=TENANT, name="Churn Risk", rules_json={"churn_risk_level": "high"}, contact_count=1, is_dynamic=True, last_computed_at=datetime.utcnow()),
            CRMSegment(id="seg_003", tenant_id=TENANT, name="New Leads (Last 30d)", rules_json={"lifecycle_stage": "lead"}, contact_count=1, is_dynamic=True, last_computed_at=datetime.utcnow()),
            CRMSegment(id="seg_004", tenant_id=TENANT, name="Repediu Recorrente", rules_json={"lifecycle_stage": "customer"}, contact_count=2, is_dynamic=True, last_computed_at=datetime.utcnow()),
        ]
        for s in segments:
            db.add(s)

        # ── RFM SNAPSHOTS ──
        rfm_data = [
            CRMRFMSnapshot(id="rfm_001", tenant_id=TENANT, contact_id="cnt_001", recency_days=3, frequency_count_90d=8, monetary_cents_90d=576000, score_json={"r": 5, "f": 5, "m": 5}, segment_label="champion"),
            CRMRFMSnapshot(id="rfm_002", tenant_id=TENANT, contact_id="cnt_003", recency_days=7, frequency_count_90d=6, monetary_cents_90d=960000, score_json={"r": 5, "f": 4, "m": 5}, segment_label="champion"),
            CRMRFMSnapshot(id="rfm_003", tenant_id=TENANT, contact_id="cnt_006", recency_days=12, frequency_count_90d=4, monetary_cents_90d=380000, score_json={"r": 4, "f": 3, "m": 4}, segment_label="loyal"),
            CRMRFMSnapshot(id="rfm_004", tenant_id=TENANT, contact_id="cnt_007", recency_days=2, frequency_count_90d=12, monetary_cents_90d=145000, score_json={"r": 5, "f": 5, "m": 3}, segment_label="loyal"),
            CRMRFMSnapshot(id="rfm_005", tenant_id=TENANT, contact_id="cnt_004", recency_days=45, frequency_count_90d=1, monetary_cents_90d=32000, score_json={"r": 1, "f": 1, "m": 1}, segment_label="lost"),
            CRMRFMSnapshot(id="rfm_006", tenant_id=TENANT, contact_id="cnt_005", recency_days=0, frequency_count_90d=0, monetary_cents_90d=0, score_json={"r": 1, "f": 1, "m": 1}, segment_label="new"),
            CRMRFMSnapshot(id="rfm_007", tenant_id=TENANT, contact_id="cnt_008", recency_days=20, frequency_count_90d=2, monetary_cents_90d=180000, score_json={"r": 3, "f": 2, "m": 3}, segment_label="at_risk"),
        ]
        for r in rfm_data:
            db.add(r)

        # ── ROLES ──
        roles = [
            CRMRole(id="role_001", tenant_id=TENANT, name="admin", permissions_json=["crm.*"], is_system=True),
            CRMRole(id="role_002", tenant_id=TENANT, name="sales", permissions_json=["crm.contacts.read", "crm.contacts.write", "crm.deals.read", "crm.deals.write", "crm.deals.move", "crm.activities.read", "crm.activities.write"], is_system=True),
            CRMRole(id="role_003", tenant_id=TENANT, name="support", permissions_json=["crm.contacts.read", "crm.tickets.read", "crm.tickets.write", "crm.activities.read"], is_system=True),
            CRMRole(id="role_004", tenant_id=TENANT, name="viewer", permissions_json=["crm.contacts.read", "crm.deals.read", "crm.tickets.read", "crm.activities.read"], is_system=True),
        ]
        for r in roles:
            db.add(r)

        # ── AI CENTER ──
        db.add(AICenter(
            id="aic_001", tenant_id=TENANT, name="Jarvis",
            autonomy_default="semi",
            allowed_tools_json=["inbox_reply", "deal_scoring", "content_generate", "ticket_resolve", "campaign_send"],
            settings_json={"language": "pt-BR", "max_auto_replies": 5, "escalation_threshold": 0.3},
        ))

        # ── AUTONOMY POLICIES ──
        policies = [
            AutonomyPolicy(id="ap_001", tenant_id=TENANT, scope="inbox_reply", mode="semi", conditions_json={"max_confidence": 0.85, "escalate_on_negative_sentiment": True}),
            AutonomyPolicy(id="ap_002", tenant_id=TENANT, scope="deal_move", mode="manual", conditions_json={}),
            AutonomyPolicy(id="ap_003", tenant_id=TENANT, scope="campaign_send", mode="manual", conditions_json={"require_approval": True}),
            AutonomyPolicy(id="ap_004", tenant_id=TENANT, scope="ticket_resolve", mode="semi", conditions_json={"auto_close_after_hours": 48}),
        ]
        for p in policies:
            db.add(p)

        # ── COST BUDGETS ──
        db.add(CostBudget(id="cb_001", tenant_id=TENANT, category="ai", monthly_limit_usd=200.0, current_spend_usd=67.50, period="2026-03"))
        db.add(CostBudget(id="cb_002", tenant_id=TENANT, category="campaigns", monthly_limit_usd=500.0, current_spend_usd=125.00, period="2026-03"))

        # ── CAMPAIGNS ──
        campaigns = [
            CRMCampaign(id="ccrm_001", tenant_id=TENANT, name="Boas-Vindas WhatsApp", type="sequence", channel="whatsapp", segment_id="seg_003", status="active", sent_count=42, opened_count=38, clicked_count=15, replied_count=8, template_json={"steps": [{"delay": "0h", "message": "Olá! Bem-vindo ao Naboah Pulse"}, {"delay": "24h", "message": "Conheça nossos recursos"}]}),
            CRMCampaign(id="ccrm_002", tenant_id=TENANT, name="Reativação de Clientes Inativos", type="drip", channel="email", segment_id="seg_002", status="draft", template_json={"subject": "Sentimos sua falta!", "body": "Volte e ganhe 20% de desconto"}),
            CRMCampaign(id="ccrm_003", tenant_id=TENANT, name="Promoção Delivery Sexta", type="broadcast", channel="whatsapp", segment_id="seg_004", status="completed", sent_count=156, opened_count=142, clicked_count=89, replied_count=34),
        ]
        for c in campaigns:
            db.add(c)

        # ── REPEDIU CONNECTION (mock) ──
        db.add(RepediuConnection(
            id="rep_001", tenant_id=TENANT,
            api_base_url="https://api.repediu.com/v1",
            api_token_encrypted="mock_encrypted_token",
            webhook_secret_encrypted="mock_webhook_secret",
            status="connected",
            last_health_at=datetime.utcnow(),
            events_received=247,
            events_failed=3,
        ))

        db.commit()
        print("CRM seed complete!")
        print(f"  - {len(contacts)} contacts")
        print(f"  - {len(companies)} companies")
        print(f"  - 1 pipeline with {len(stages)} stages")
        print(f"  - {len(deals)} deals")
        print(f"  - {len(activities)} activities")
        print(f"  - {len(tickets)} tickets")
        print(f"  - {len(orders)} orders")
        print(f"  - {len(segments)} segments")
        print(f"  - {len(rfm_data)} RFM snapshots")
        print(f"  - {len(campaigns)} campaigns")
        print(f"  - Roles, AI Center, Policies, Budgets, Repediu connection")


if __name__ == "__main__":
    seed()
