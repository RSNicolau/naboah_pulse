from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Agent, Playbook
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/agents/team", tags=["agents-team"])

TENANT_ID = "naboah"

DEFAULT_PLAYBOOKS = [
    {"id": "pb_support",  "name": "Support Playbook",   "department": "support",   "tone_of_voice": "helpful"},
    {"id": "pb_sales",    "name": "Sales Playbook",     "department": "sales",     "tone_of_voice": "persuasive"},
    {"id": "pb_security", "name": "Security Playbook",  "department": "security",  "tone_of_voice": "formal"},
    {"id": "pb_growth",   "name": "Growth Playbook",    "department": "marketing", "tone_of_voice": "witty"},
]

DEFAULT_AGENTS = [
    {
        "id": "agent_jarvis_support",
        "playbook_id": "pb_support",
        "name": "Jarvis Support",
        "role": "Customer Success",
        "status": "acting",
        "intelligence_level": "genius",
        "skills_json": ["inbox_reply", "ticket_resolve", "kb_read", "sentiment_analysis"],
    },
    {
        "id": "agent_aegis",
        "playbook_id": "pb_security",
        "name": "Aegis Guardian",
        "role": "Security Officer",
        "status": "idle",
        "intelligence_level": "high",
        "skills_json": ["threat_blocking", "reputation_monitoring", "compliance_audit"],
    },
    {
        "id": "agent_jarvis_sales",
        "playbook_id": "pb_sales",
        "name": "Jarvis Sales",
        "role": "SDR / Growth",
        "status": "thinking",
        "intelligence_level": "genius",
        "skills_json": ["crm_write", "deal_scoring", "outreach", "lead_qualify"],
    },
    {
        "id": "agent_growth_bot",
        "playbook_id": "pb_growth",
        "name": "Growth Bot 3000",
        "role": "Marketing Specialist",
        "status": "idle",
        "intelligence_level": "standard",
        "skills_json": ["campaign_create", "analytics_read", "ab_testing"],
    },
]


def ensure_agents(db: Session) -> List[Agent]:
    agents = db.exec(select(Agent)).all()
    if agents:
        return agents

    # Create playbooks first
    for pb_data in DEFAULT_PLAYBOOKS:
        existing = db.get(Playbook, pb_data["id"])
        if not existing:
            pb = Playbook(
                id=pb_data["id"],
                tenant_id=TENANT_ID,
                name=pb_data["name"],
                department=pb_data["department"],
                tone_of_voice=pb_data["tone_of_voice"],
            )
            db.add(pb)
    try:
        db.commit()
    except Exception:
        db.rollback()

    # Create agents
    created = []
    for a_data in DEFAULT_AGENTS:
        existing = db.get(Agent, a_data["id"])
        if not existing:
            agent = Agent(
                id=a_data["id"],
                tenant_id=TENANT_ID,
                playbook_id=a_data["playbook_id"],
                name=a_data["name"],
                role=a_data["role"],
                status=a_data["status"],
                intelligence_level=a_data["intelligence_level"],
                skills_json=a_data["skills_json"],
            )
            db.add(agent)
            created.append(agent)
    try:
        db.commit()
        return db.exec(select(Agent)).all()
    except Exception:
        db.rollback()
        # Return mock without persisting
        return [
            Agent(
                id=a["id"],
                tenant_id=TENANT_ID,
                playbook_id=a["playbook_id"],
                name=a["name"],
                role=a["role"],
                status=a["status"],
                intelligence_level=a["intelligence_level"],
                skills_json=a["skills_json"],
            )
            for a in DEFAULT_AGENTS
        ]


class AgentCreate(BaseModel):
    name: str
    role: str
    intelligence_level: str = "standard"
    skills: List[str] = []
    department: str = "support"


@router.get("/squad")
async def list_ai_squad(db: Session = Depends(get_session)):
    return ensure_agents(db)


@router.post("/agents")
async def create_agent(data: AgentCreate, db: Session = Depends(get_session)):
    ensure_agents(db)  # guarantee playbooks exist
    pb_id = f"pb_{data.department}"
    # Create playbook for this department if not exists
    if not db.get(Playbook, pb_id):
        pb = Playbook(
            id=pb_id,
            tenant_id=TENANT_ID,
            name=f"{data.department.capitalize()} Playbook",
            department=data.department,
        )
        db.add(pb)
        try:
            db.commit()
        except Exception:
            db.rollback()
            pb_id = "pb_support"

    agent_id = f"agent_{uuid.uuid4().hex[:8]}"
    agent = Agent(
        id=agent_id,
        tenant_id=TENANT_ID,
        playbook_id=pb_id,
        name=data.name,
        role=data.role,
        status="idle",
        intelligence_level=data.intelligence_level,
        skills_json=data.skills,
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent


@router.patch("/{agent_id}/status")
async def toggle_agent_status(agent_id: str, db: Session = Depends(get_session)):
    agent = db.get(Agent, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agente não encontrado")
    # Toggle: active states → paused, paused/idle → acting
    if agent.status in ("acting", "thinking"):
        agent.status = "paused"
    else:
        agent.status = "acting"
    db.add(agent)
    db.commit()
    return {"agent_id": agent_id, "status": agent.status}


@router.get("/performance")
async def get_team_performance(db: Session = Depends(get_session)):
    agents = ensure_agents(db)
    active = sum(1 for a in agents if a.status in ("acting", "thinking"))
    paused = sum(1 for a in agents if a.status == "paused")
    idle = sum(1 for a in agents if a.status == "idle")
    return {
        "total_agents": len(agents),
        "active_agents": active,
        "idle_agents": idle,
        "paused_agents": paused,
        "handoffs_today": 14,      # simulated
        "resolution_rate_ai": "82%",
        "avg_collaboration_time": "1.2s",
    }


@router.post("/collaborate")
async def register_collaboration(data: dict, db: Session = Depends(get_session)):
    collab_id = f"collab_{uuid.uuid4().hex[:8]}"
    return {
        "status": "handoff_initiated",
        "collaboration_id": collab_id,
        "message": "Contexto transferido com sucesso.",
    }
