from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Agent, Playbook, AgentTask
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4

router = APIRouter(prefix="/agents", tags=["agents"])

TENANT_ID = "naboah"

class DeployRequest(BaseModel):
    agent_id: str

class TaskCreateRequest(BaseModel):
    agent_id: str
    type: str
    priority: Optional[int] = 1
    input_payload: Optional[dict] = {}

@router.get("/")
async def list_agents(db: Session = Depends(get_session)):
    agents = db.exec(
        select(Agent).where(Agent.tenant_id == TENANT_ID)
    ).all()
    return agents

@router.post("/deploy")
async def deploy_agent(data: DeployRequest, db: Session = Depends(get_session)):
    agent = db.exec(
        select(Agent).where(Agent.id == data.agent_id)
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.status = "acting"
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {"message": "Agent deployed successfully", "status": agent.status, "agent": agent}

@router.get("/playbooks")
async def list_playbooks(db: Session = Depends(get_session)):
    playbooks = db.exec(
        select(Playbook).where(Playbook.tenant_id == TENANT_ID)
    ).all()
    return playbooks

@router.post("/tasks")
async def create_task(data: TaskCreateRequest, db: Session = Depends(get_session)):
    # Validate agent exists
    agent = db.exec(
        select(Agent).where(Agent.id == data.agent_id)
    ).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    task_id = f"task_{uuid4().hex[:8]}"
    new_task = AgentTask(
        id=task_id,
        tenant_id=TENANT_ID,
        agent_id=data.agent_id,
        type=data.type,
        priority=data.priority,
        status="pending",
        input_payload=data.input_payload or {},
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"task_id": new_task.id, "status": new_task.status, "task": new_task}
