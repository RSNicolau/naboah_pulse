"""
Seed AI Engine Enterprise 2.0 — departments, roles, skill packages, skills, executions.
Run: cd apps/api && python3 seed_ai_engine.py
"""
import uuid
import random
from datetime import datetime, timedelta
from config import settings
from sqlalchemy import create_engine
from sqlmodel import Session, select
from db import init_db
from models import (
    Agent, AIDepartment, AIRole, AISkillPackage, AISkill, AIAgentExecution,
)

TENANT_ID = "naboah"
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
        print("  AI ENGINE 2.0 — Seed")
        print("=" * 50)

        # ── 1. Departments ──
        DEPARTMENTS = [
            ("dept_engineering", "Engineering", "AI development, model training, and infrastructure management."),
            ("dept_sales", "Sales", "Revenue generation, deal management, and outbound prospecting."),
            ("dept_support", "Support", "Customer support, ticket resolution, and knowledge base management."),
            ("dept_marketing", "Marketing", "Content creation, campaign management, and growth analytics."),
        ]
        for did, name, desc in DEPARTMENTS:
            if not exists(db, AIDepartment, did):
                db.add(AIDepartment(
                    id=did, tenant_id=TENANT_ID, name=name, description=desc,
                    settings_json={"auto_assign": True, "escalation_enabled": True},
                    is_active=True, created_at=ago(days=30), updated_at=ago(days=1),
                ))
                print(f"  + Department: {name}")
        db.commit()

        # ── 2. Roles ──
        ROLES = [
            ("role_director", "dept_engineering", "AI Director",
             "Oversees all AI operations and approves critical decisions.",
             ["ai.*"], ["*"], "auto", 500, True, True),
            ("role_senior", "dept_engineering", "Senior Agent",
             "Handles complex tasks with high autonomy and API access.",
             ["ai.skills.*", "ai.executions.view"], ["*"], "auto", 200, True, True),
            ("role_agent", "dept_support", "Agent",
             "Standard agent with balanced permissions for daily operations.",
             ["ai.skills.support", "ai.skills.crm", "ai.skills.general"], ["ticket_resolve", "crm_access", "kb_search"], "semi", 100, False, True),
            ("role_junior", "dept_support", "Junior Agent",
             "Limited access agent for supervised task execution.",
             ["ai.skills.support", "ai.skills.general"], ["kb_search", "ticket_resolve"], "manual", 50, False, True),
            ("role_specialist", "dept_sales", "Sales Specialist",
             "Focused on sales pipeline and deal management tasks.",
             ["ai.skills.sales", "ai.skills.crm", "ai.skills.analytics"], ["deal_management", "pipeline_analytics", "email_outreach"], "semi", 150, True, True),
            ("role_observer", "dept_marketing", "Observer",
             "Read-only access for monitoring and reporting purposes.",
             ["ai.executions.view"], [], "manual", 10, False, True),
        ]
        for rid, dept_id, name, desc, perms, skills, autonomy, max_exec, api, is_sys in ROLES:
            if not exists(db, AIRole, rid):
                db.add(AIRole(
                    id=rid, tenant_id=TENANT_ID, department_id=dept_id,
                    name=name, description=desc,
                    permissions_json=perms, default_skills_json=skills,
                    autonomy_level=autonomy, max_executions_day=max_exec,
                    external_api_allowed=api, is_system=is_sys,
                    created_at=ago(days=28),
                ))
                print(f"  + Role: {name}")
        db.commit()

        # ── 3. Skill Packages ──
        PACKAGES = [
            ("pkg_core_v1", "Core Skills Pack", 1, "Essential skills for everyday agent operations.",
             "Pulse Team", "active", 5),
            ("pkg_crm_v1", "CRM Skills Pack", 1, "Sales and customer relationship management capabilities.",
             "Pulse Team", "active", 5),
        ]
        for pid, name, ver, desc, author, status, count in PACKAGES:
            if not exists(db, AISkillPackage, pid):
                db.add(AISkillPackage(
                    id=pid, tenant_id=TENANT_ID, name=name, version=ver,
                    description=desc, author=author, status=status,
                    validation_report_json={
                        "valid": True, "errors": [], "warnings": [],
                        "validated_at": ago(days=14).isoformat(),
                    },
                    skills_count=count,
                    metadata_json={"name": name, "version": str(ver), "author": author, "description": desc},
                    created_at=ago(days=14), updated_at=ago(days=2),
                ))
                print(f"  + Package: {name}")
        db.commit()

        # ── 4. Skills ──
        SKILLS = [
            # Core Skills Pack
            ("skill_kb_search", "pkg_core_v1", "Knowledge Base Search", "Search and retrieve articles from the knowledge base.",
             {"query": "string", "max_results": "integer"}, {"articles": "array", "relevance_scores": "array"}, "support"),
            ("skill_ticket_resolve", "pkg_core_v1", "Ticket Resolution", "Analyze and resolve support tickets with AI-powered suggestions.",
             {"ticket_id": "string", "context": "string"}, {"resolution": "string", "confidence": "number"}, "support"),
            ("skill_sentiment", "pkg_core_v1", "Sentiment Analysis", "Analyze text sentiment and emotional tone in messages.",
             {"text": "string", "language": "string"}, {"sentiment": "string", "score": "number", "emotions": "object"}, "analytics"),
            ("skill_summarize", "pkg_core_v1", "Text Summarization", "Generate concise summaries from long conversations or documents.",
             {"text": "string", "max_length": "integer"}, {"summary": "string", "key_points": "array"}, "general"),
            ("skill_translate", "pkg_core_v1", "Auto Translation", "Translate messages between supported languages in real-time.",
             {"text": "string", "source_lang": "string", "target_lang": "string"}, {"translated_text": "string", "detected_lang": "string"}, "general"),

            # CRM Skills Pack
            ("skill_deal_score", "pkg_crm_v1", "Deal Scoring", "Score and rank deals based on engagement, history, and fit signals.",
             {"deal_id": "string"}, {"score": "number", "factors": "array", "recommendation": "string"}, "sales"),
            ("skill_lead_enrich", "pkg_crm_v1", "Lead Enrichment", "Enrich contact profiles with external data sources and social signals.",
             {"contact_id": "string"}, {"enriched_fields": "object", "sources": "array"}, "crm"),
            ("skill_email_draft", "pkg_crm_v1", "Email Draft Generation", "Generate personalized sales email drafts based on contact context.",
             {"contact_id": "string", "template": "string", "tone": "string"}, {"subject": "string", "body": "string"}, "sales"),
            ("skill_churn_predict", "pkg_crm_v1", "Churn Prediction", "Predict customer churn risk using behavioral and transactional data.",
             {"contact_id": "string"}, {"churn_risk": "number", "risk_factors": "array", "retention_actions": "array"}, "analytics"),
            ("skill_pipeline_forecast", "pkg_crm_v1", "Pipeline Forecasting", "Forecast pipeline revenue and conversion rates for upcoming periods.",
             {"pipeline_id": "string", "period_days": "integer"}, {"forecast_revenue": "number", "conversion_rate": "number", "confidence": "number"}, "sales"),
        ]
        for sid, pkg_id, name, desc, inp, out, cat in SKILLS:
            if not exists(db, AISkill, sid):
                db.add(AISkill(
                    id=sid, tenant_id=TENANT_ID, package_id=pkg_id,
                    name=name, description=desc,
                    input_schema_json=inp, output_schema_json=out,
                    category=cat, is_active=True,
                    execution_count=random.randint(5, 120),
                    last_executed_at=ago(hours=random.randint(1, 72)),
                    created_at=ago(days=14),
                ))
                print(f"  + Skill: {name}")
        db.commit()

        # ── 5. Update Existing Agents with Department + Role ──
        AGENT_UPDATES = {
            "ag_support":  ("dept_support",    "role_agent",      "semi",  100, False),
            "ag_sales":    ("dept_sales",      "role_specialist", "auto",  200, True),
            "ag_security": ("dept_engineering", "role_senior",    "semi",  150, False),
            "ag_growth":   ("dept_marketing",  "role_agent",      "semi",  100, True),
        }
        for agent_id, (dept, role, autonomy, max_exec, api) in AGENT_UPDATES.items():
            agent = db.get(Agent, agent_id)
            if agent:
                agent.department_id = dept
                agent.role_id = role
                agent.autonomy_level = autonomy
                agent.max_executions_day = max_exec
                agent.external_api_allowed = api
                db.add(agent)
                print(f"  ~ Agent {agent.name}: dept={dept}, role={role}")
        db.commit()

        # ── 6. Set Department Heads ──
        dept_eng = db.get(AIDepartment, "dept_engineering")
        if dept_eng and not dept_eng.head_agent_id:
            dept_eng.head_agent_id = "ag_security"
            db.add(dept_eng)

        dept_support = db.get(AIDepartment, "dept_support")
        if dept_support and not dept_support.head_agent_id:
            dept_support.head_agent_id = "ag_support"
            db.add(dept_support)

        dept_sales = db.get(AIDepartment, "dept_sales")
        if dept_sales and not dept_sales.head_agent_id:
            dept_sales.head_agent_id = "ag_sales"
            db.add(dept_sales)

        dept_mkt = db.get(AIDepartment, "dept_marketing")
        if dept_mkt and not dept_mkt.head_agent_id:
            dept_mkt.head_agent_id = "ag_growth"
            db.add(dept_mkt)
        db.commit()

        # ── 7. Sample Executions ──
        EXECUTIONS = [
            ("ag_support", "skill_ticket_resolve", "user_system", "completed",
             {"ticket_id": "tick_naboah_0", "context": "Customer billing inquiry"},
             {"resolution": "Applied 10% discount and updated billing", "confidence": 0.94},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 1250),
            ("ag_support", "skill_kb_search", "user_system", "completed",
             {"query": "password reset instructions", "max_results": 5},
             {"articles": ["kb_001", "kb_007"], "relevance_scores": [0.95, 0.82]},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 340),
            ("ag_sales", "skill_deal_score", "user_system", "completed",
             {"deal_id": "deal_naboah_0"},
             {"score": 87, "factors": ["high engagement", "budget confirmed"], "recommendation": "Schedule demo"},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 890),
            ("ag_sales", "skill_email_draft", "user_system", "completed",
             {"contact_id": "crmcontact_001", "template": "follow_up", "tone": "professional"},
             {"subject": "Following up on our conversation", "body": "Hi Maria, ..."},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 2100),
            ("ag_growth", "skill_sentiment", "user_system", "completed",
             {"text": "Adorei o atendimento, muito rápido!", "language": "pt-BR"},
             {"sentiment": "positive", "score": 0.96, "emotions": {"joy": 0.85, "surprise": 0.15}},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 450),
            ("ag_growth", "skill_summarize", "user_system", "completed",
             {"text": "Long conversation about product features...", "max_length": 200},
             {"summary": "Customer interested in Pro plan features, requested demo.", "key_points": ["Pro plan", "Demo request", "Budget approved"]},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 780),
            ("ag_security", "skill_sentiment", "user_system", "completed",
             {"text": "System detected unusual login pattern from IP 192.168.1.45", "language": "en"},
             {"sentiment": "neutral", "score": 0.12, "emotions": {"concern": 0.6}},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 320),
            ("ag_sales", "skill_churn_predict", "user_system", "completed",
             {"contact_id": "crmcontact_002"},
             {"churn_risk": 0.72, "risk_factors": ["low engagement", "no purchase in 60 days"], "retention_actions": ["personalized offer", "re-engagement email"]},
             None, {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 1560),
            ("ag_support", "skill_translate", "user_system", "failed",
             {"text": "Hello world", "source_lang": "en", "target_lang": "zh"},
             None, "Translation service timeout after 30s",
             {"allowed": True, "checks": {"user": True, "role": True, "department": True, "agent": True, "daily_limit": True}}, 30000),
            ("ag_growth", "skill_pipeline_forecast", "user_system", "blocked",
             {"pipeline_id": "pipe_001", "period_days": 90},
             None, None,
             {"allowed": False, "blocked_by": "role", "reason": "Role 'Agent' does not have permission for category 'sales'", "checks": {"user": True, "role": False}}, 12),
        ]
        for i, (agent_id, skill_id, triggered, status, inp, out, err, perm, ms) in enumerate(EXECUTIONS):
            eid = f"exec_{TENANT_ID}_{i}"
            if not exists(db, AIAgentExecution, eid):
                db.add(AIAgentExecution(
                    id=eid, tenant_id=TENANT_ID, agent_id=agent_id, skill_id=skill_id,
                    triggered_by=triggered, status=status,
                    input_json=inp, output_json=out, error_message=err,
                    permission_check_json=perm, execution_time_ms=ms,
                    created_at=ago(hours=random.randint(1, 168)),
                ))
                print(f"  + Execution: {agent_id} → {skill_id} [{status}]")
        db.commit()

        print()
        print("=" * 50)
        print(f"  AI Engine 2.0 seed complete!")
        print(f"  Departments: {len(DEPARTMENTS)}")
        print(f"  Roles:       {len(ROLES)}")
        print(f"  Packages:    {len(PACKAGES)}")
        print(f"  Skills:      {len(SKILLS)}")
        print(f"  Executions:  {len(EXECUTIONS)}")
        print("=" * 50)


if __name__ == "__main__":
    seed()
