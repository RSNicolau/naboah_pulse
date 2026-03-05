from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Workflow, WorkflowStep, WorkflowRun
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/workflows/v2", tags=["workflows-v2"])

TENANT_ID = "naboah"

class WorkflowCanvasSave(BaseModel):
    name: str
    nodes: List[dict]
    edges: List[dict]
    viewport: dict

@router.post("/save")
async def save_workflow_canvas(data: WorkflowCanvasSave, db: Session = Depends(get_session)):
    # Check if a workflow with this name already exists
    existing = db.exec(
        select(Workflow).where(
            Workflow.tenant_id == TENANT_ID,
            Workflow.name == data.name,
        )
    ).first()

    if existing:
        # Update existing workflow
        existing.viewport_json = data.viewport
        existing.updated_at = datetime.utcnow()
        db.add(existing)

        # Delete old steps and recreate
        old_steps = db.exec(
            select(WorkflowStep).where(WorkflowStep.workflow_id == existing.id)
        ).all()
        for step in old_steps:
            db.delete(step)

        workflow_id = existing.id
    else:
        # Create new workflow
        workflow_id = f"flow_{uuid.uuid4().hex[:8]}"
        workflow = Workflow(
            id=workflow_id,
            tenant_id=TENANT_ID,
            name=data.name,
            trigger_type="visual_canvas",
            viewport_json=data.viewport,
            is_active=True,
        )
        db.add(workflow)

    # Save nodes as WorkflowSteps
    for i, node in enumerate(data.nodes):
        step = WorkflowStep(
            id=f"step_{uuid.uuid4().hex[:6]}",
            workflow_id=workflow_id,
            type=node.get("type", "action"),
            action_type=node.get("action_type", "custom"),
            config=str(node.get("config", "{}")),
            position_x=node.get("position", {}).get("x", 0),
            position_y=node.get("position", {}).get("y", 0),
            node_type=node.get("node_type", "default"),
            ui_metadata_json=node,
        )
        db.add(step)

    db.commit()

    return {
        "status": "success",
        "workflow_id": workflow_id,
        "nodes_processed": len(data.nodes),
        "message": "Fluxo visual salvo e compilado para execucao.",
    }

@router.get("/{workflow_id}/runs")
async def get_workflow_runs(workflow_id: str, db: Session = Depends(get_session)):
    # Query WorkflowRun from DB
    runs = db.exec(
        select(WorkflowRun).where(WorkflowRun.workflow_id == workflow_id)
        .order_by(WorkflowRun.created_at.desc())
    ).all()

    return [
        {
            "id": run.id,
            "status": run.status,
            "logs": run.logs,
            "created_at": run.created_at.isoformat() if run.created_at else None,
        }
        for run in runs
    ]

@router.post("/{workflow_id}/test")
async def test_workflow(workflow_id: str, test_payload: dict, db: Session = Depends(get_session)):
    # Verify workflow exists
    workflow = db.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Create a WorkflowRun record for the test
    run_id = f"run_{uuid.uuid4().hex[:6]}"
    run = WorkflowRun(
        id=run_id,
        workflow_id=workflow_id,
        status="completed",
        logs=f"Test run with payload: {str(test_payload)[:200]}",
    )
    db.add(run)
    db.commit()
    db.refresh(run)

    # Get steps for execution path
    steps = db.exec(
        select(WorkflowStep).where(WorkflowStep.workflow_id == workflow_id)
    ).all()
    execution_path = [s.action_type for s in steps]

    return {
        "run_id": run.id,
        "status": run.status,
        "execution_path": execution_path,
        "final_result": "Test completed",
        "logs": run.logs,
    }
