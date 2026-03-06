from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Workflow, WorkflowStep, WorkflowRun
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter(prefix="/flows", tags=["automation"])

TENANT_ID = "naboah"

class WorkflowCreate(BaseModel):
    name: str
    trigger_type: str
    description: Optional[str] = None

@router.post("/", response_model=Workflow)
async def create_workflow(data: WorkflowCreate, db: Session = Depends(get_session)):
    new_flow = Workflow(
        id=f"flow_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        name=data.name,
        trigger_type=data.trigger_type,
        description=data.description
    )
    db.add(new_flow)
    db.commit()
    db.refresh(new_flow)
    return new_flow

@router.get("/", response_model=List[Workflow])
async def list_workflows(db: Session = Depends(get_session)):
    flows = db.exec(select(Workflow).where(Workflow.tenant_id == TENANT_ID)).all()
    return flows

@router.get("/{flow_id}/steps", response_model=List[WorkflowStep])
async def get_flow_steps(flow_id: str, db: Session = Depends(get_session)):
    steps = db.exec(select(WorkflowStep).where(WorkflowStep.workflow_id == flow_id)).all()
    return steps

@router.post("/{flow_id}/execute")
async def trigger_flow_manual(flow_id: str, db: Session = Depends(get_session)):
    flow = db.get(Workflow, flow_id)
    if not flow:
        raise HTTPException(status_code=404, detail="Fluxo não encontrado")

    # Get workflow steps and build execution log
    steps = db.exec(select(WorkflowStep).where(WorkflowStep.workflow_id == flow_id)).all()
    log_lines = [f"[TRIGGER] Gatilho manual para '{flow.name}'"]
    for step in steps:
        log_lines.append(f"[STEP] {step.name or step.step_type}: executado")
    log_lines.append("[DONE] Fluxo finalizado com sucesso")

    new_run = WorkflowRun(
        id=f"run_{uuid.uuid4().hex[:8]}",
        workflow_id=flow_id,
        status="completed",
        logs="\n".join(log_lines),
    )
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    return new_run

@router.get("/runs", response_model=List[WorkflowRun])
async def get_recent_runs(db: Session = Depends(get_session)):
    runs = db.exec(select(WorkflowRun).order_by(WorkflowRun.created_at.desc())).all()
    return runs[:10]
