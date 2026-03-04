from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import SecurityAlert, DLPPolicy, AuditSession
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/shield", tags=["shield"])

@router.get("/alerts", response_model=List[SecurityAlert])
async def list_security_alerts(db: Session = Depends(get_session)):
    alerts = db.exec(select(SecurityAlert)).all()
    if not alerts:
        return [
            SecurityAlert(
                id="al_1", 
                tenant_id="t1", 
                type="anomalous_access", 
                severity="high", 
                description="Acesso detectado de IP incomum (Rússia) para o usuário Admin.",
                metadata_json={"ip": "95.161.220.12", "location": "Moscow, RU"}
            ),
            SecurityAlert(
                id="al_2", 
                tenant_id="t1", 
                type="data_leak_attempt", 
                severity="medium", 
                description="Tentativa de envio de 15 números de cartões de crédito bloqueada via DLP.",
                metadata_json={"channel": "WhatsApp", "blocked_count": 15}
            )
        ]
    return alerts

@router.get("/policies", response_model=List[DLPPolicy])
async def list_dlp_policies(db: Session = Depends(get_session)):
    return [
        DLPPolicy(id="p_1", tenant_id="t1", name="Mascara Cartões de Crédito", pattern_type="ai_entity", action="mask"),
        DLPPolicy(id="p_2", tenant_id="t1", name="Bloqueio de CPFs Sensíveis", pattern_type="ai_entity", action="block"),
    ]

@router.post("/policies")
async def create_dlp_policy(policy: dict, db: Session = Depends(get_session)):
    return {"status": "policy_created", "id": f"pol_{uuid.uuid4().hex[:6]}"}

@router.get("/audit/sessions")
async def get_audit_sessions():
    return [
        {"id": "sess_1", "user": "Rodrigo Nicolau", "ip": "189.10.22.4", "duration": "45m", "risk": "low"},
        {"id": "sess_2", "user": "Admin Bot", "ip": "Unknown", "duration": "2m", "risk": "critical"},
    ]
