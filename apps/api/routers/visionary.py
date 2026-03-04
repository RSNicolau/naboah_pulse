from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import UIState
from pydantic import BaseModel
from typing import List, Optional, Any
import uuid
from datetime import datetime

router = APIRouter(prefix="/visionary", tags=["visionary"])

class UICommandRequest(BaseModel):
    prompt: str
    current_context: dict

@router.post("/generate-component")
async def generate_ui_component(request: UICommandRequest):
    # Simulação de Jarvis interpretando o prompt e gerando um componente
    # Em produção, isso chamaria uma LLM que retorna uma estrutura de component-schema
    return {
        "component_type": "dynamic_widget",
        "title": "Análise Preditiva de Vendas",
        "props": {
            "chart_type": "area",
            "data": [
                {"label": "Jan", "value": 400},
                {"label": "Feb", "value": 700},
                {"label": "Mar", "value": 900}
            ],
            "insight": "Crescimento de 15% projetado para o próximo trimestre."
        },
        "id": f"gen_{uuid.uuid4().hex[:6]}"
    }

@router.get("/state/{context_key}", response_model=Optional[UIState])
async def get_ui_state(context_key: str, db: Session = Depends(get_session)):
    # Retorna um estado mockado se não houver no DB
    return UIState(
        id="ui_1",
        tenant_id="t1",
        user_id="u1",
        context_key=context_key,
        layout_json={"sidebar_mode": "expanded", "active_tools": ["calculator", "knowledge_base"]},
        widgets_json=[{"id": "w1", "type": "kpi_card", "props": {"title": "Risk Level", "value": "Low"}}]
    )

@router.post("/state")
async def save_ui_state(state: dict, db: Session = Depends(get_session)):
    return {"status": "success", "message": "Estado de interface persistido."}
