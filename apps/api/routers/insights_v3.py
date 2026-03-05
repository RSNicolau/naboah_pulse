from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import StrategyScenario, AnalysisNarrative
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

router = APIRouter(prefix="/insights/v3", tags=["insights_v3"])

TENANT_ID = "naboah"

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
        tenant_id=TENANT_ID,
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
    # Query AnalysisNarrative for the given period
    narrative = db.exec(
        select(AnalysisNarrative).where(
            AnalysisNarrative.tenant_id == TENANT_ID,
            AnalysisNarrative.period == period
        )
    ).first()

    if narrative:
        return {
            "period": narrative.period,
            "narrative_html": narrative.narrative_html,
            "key_metrics": narrative.key_metrics_json,
            "created_at": narrative.created_at.isoformat() if narrative.created_at else None,
        }

    # If no narrative exists for this period, return empty structure
    return {
        "period": period,
        "narrative_html": f"<p>Nenhum relatório executivo encontrado para o periodo <strong>{period}</strong>.</p>",
        "key_metrics": {},
        "created_at": None,
    }

@router.get("/strategy/recommendations")
async def get_recommendations(db: Session = Depends(get_session)):
    # Query StrategyScenario for recommendations
    scenarios = db.exec(
        select(StrategyScenario).where(
            StrategyScenario.tenant_id == TENANT_ID
        ).order_by(StrategyScenario.created_at.desc())
    ).all()

    if not scenarios:
        return []

    result = []
    for s in scenarios:
        # Determine priority based on confidence
        if s.confidence_score >= 0.9:
            priority = "critical"
        elif s.confidence_score >= 0.7:
            priority = "high"
        else:
            priority = "medium"

        result.append({
            "id": s.id,
            "priority": priority,
            "title": s.name,
            "projected_revenue": s.projected_revenue,
            "confidence_score": s.confidence_score,
            "parameters": s.parameters_json,
            "reason": f"Receita projetada: R$ {s.projected_revenue:,.2f} (confianca: {s.confidence_score:.0%})",
        })

    return result
