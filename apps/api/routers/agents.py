from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Agent, Playbook, AgentTask
from typing import List

router = APIRouter(prefix="/agents", tags=["agents"])

@router.get("/")
async def list_agents(db: Session = Depends(get_session)):
    agents = db.exec(select(Agent)).all()
    return agents

@router.post("/deploy")
async def deploy_agent(agent_data: dict, db: Session = Depends(get_session)):
    # Logic to initialize and deploy an agent
    return {"message": "Agent deployed successfully", "status": "thinking"}

@router.get("/playbooks")
async def list_playbooks(db: Session = Depends(get_session)):
    playbooks = db.exec(select(Playbook)).all()
    return playbooks

@router.post("/tasks")
async def create_task(task: dict, db: Session = Depends(get_session)):
    # Logic to queue a task for an agent
    return {"task_id": "job_agent_001", "status": "queued"}
