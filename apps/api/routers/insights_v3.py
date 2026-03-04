from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import StrategyScenario, AnalysisNarrative
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

router = APIRouter(prefix="/insights/v3", tags=["insights_v3"])

class ScenarioCreate(BaseModel):
    name: str
    parameters: Dict[str, float]

@router.post("/scenarios")
async def create_scenario(data: ScenarioCreate, db: Session = Depends(get_session)):
    # Simulação de cálculo de projeção (mock logic)
    projected = 0
    if "price_change" in data.parameters:
        projected = 500000 * (1 + data.parameters["price_change"])
    
    scenario = StrategyScenario(
        id=f"scn_{uuid.uuid4().hex[:6]}",
        tenant_id="t1",
        name=data.name,
        parameters_json=data.parameters,
        projected_revenue=projected,
        confidence_score=0.85
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return scenario

@router.get("/reports/executive/{period}")
async def get_executive_summary(period: str, db: Session = Depends(get_session)):
    # Simulação de geração de narrativa IA
    narrative = f"""
    <p>O período de <strong>{period}</strong> apresentou um crescimento resiliente de 12% no MRR.</p>
    <p>Identificamos que a campanha 'Pulse Horizon' foi o principal motor de aquisição, respondendo por 45% dos novos leads.</p>
    <p><span class='text-primary'>Insight Jarvis:</span> O churn na região us-east-1 está acima da média (4.2%). Recomendo revisar a latência de rede capturada na Phase 37.</p>
    """
    return {
        "period": period,
        "narrative_html": narrative,
        "sentiment": "positive",
        "key_metrics": {
            "mrr": 450000,
            "growth": 1.12,
            "top_channel": "Direct/Referral"
        }
    }

@router.get("/strategy/recommendations")
async def get_recommendations():
    return [
        {"id": 1, "priority": "high", "title": "Diversificação de Ad Spend", "reason": "CPA no LinkedIn subiu 20%"},
        {"id": 2, "priority": "medium", "title": "Expansion Campaign: Global", "reason": "Alta demanda detectada em EUR/BRL na Phase 35"},
        {"id": 3, "priority": "critical", "title": "Session Pinning Audit", "reason": "Tentativas de bypass detectadas pelo Pulse Shield"}
    ]
