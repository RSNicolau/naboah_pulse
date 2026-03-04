from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import BusinessForecast, Contact
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("/revenue-forecast")
async def get_revenue_forecast(db: Session = Depends(get_session)):
    # Mock de previsão de receita baseada em dados históricos
    today = datetime.utcnow()
    return {
        "scenario": "conservative",
        "predicted_revenue_30d": 125400.00,
        "growth_rate_projected": "+12%",
        "confidence": 0.89,
        "data_points": [
            {"date": (today + timedelta(days=i)).strftime("%Y-%m-%d"), "value": 4000 + (i * 150)} 
            for i in range(30)
        ]
    }

@router.get("/churn-risk")
async def get_churn_risk(db: Session = Depends(get_session)):
    # Mock de clientes em risco identificados pela IA
    return [
        {"contact_id": "c1", "name": "Empresa X", "risk": "high", "reasons": ["Baixo engajamento", "Tickets de suporte abertos por > 48h"]},
        {"contact_id": "c2", "name": "João Silva", "risk": "medium", "reasons": ["Inatividade nos últimos 7 dias"]},
    ]

@router.get("/ltv-analysis")
async def get_ltv_analysis():
    return {
        "avg_ltv_per_segment": {
            "enterprise": 45000.00,
            "smb": 8500.00,
            "starter": 1200.00
        },
        "top_performing_channels": ["WhatsApp Sales", "Email Re-engagement"]
    }

@router.post("/recalculate")
async def trigger_recalculation():
    # Jarvis re-processando toda a base de dados
    return {"status": "recalculation_triggered", "eta": "10 minutes"}
