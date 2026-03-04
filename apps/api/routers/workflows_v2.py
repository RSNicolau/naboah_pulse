from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Workflow, WorkflowStep
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/workflows/v2", tags=["workflows-v2"])

class WorkflowCanvasSave(BaseModel):
    name: str
    nodes: List[dict]
    edges: List[dict]
    viewport: dict

@router.post("/save")
async def save_workflow_canvas(data: WorkflowCanvasSave, db: Session = Depends(get_session)):
    # Simulação de persistência de fluxo visual complexo
    workflow_id = f"flow_{uuid.uuid4().hex[:8]}"
    return {
        "status": "success",
        "workflow_id": workflow_id,
        "nodes_processed": len(data.nodes),
        "message": "Fluxo visual salvo e compilado para execução."
    }

@router.get("/{workflow_id}/runs")
async def get_workflow_runs(workflow_id: str):
    return [
        {"id": "run_1", "status": "completed", "started_at": "2026-03-03T20:00:00Z", "nodes_hit": 5},
        {"id": "run_2", "status": "failed", "error": "AI Vision Timeout", "failed_at_node": "extract_ocr_1"}
    ]

@router.post("/{workflow_id}/test")
async def test_workflow(workflow_id: str, test_payload: dict):
    # Simulação de execução em ambiente de sandbox
    return {
        "execution_path": ["trigger_webhook", "jarvis_sentiment", "if_positive", "send_whatsapp"],
        "final_result": "Message sent successfully",
        "logs": "Trace extracted for debugging"
    }
