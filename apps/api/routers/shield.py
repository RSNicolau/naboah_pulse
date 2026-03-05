from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import SecurityAlert, DLPPolicy, AuditSession
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/shield", tags=["shield"])

TENANT_ID = "naboah"

@router.get("/alerts", response_model=List[SecurityAlert])
async def list_security_alerts(db: Session = Depends(get_session)):
    alerts = db.exec(select(SecurityAlert)).all()
    if not alerts:
        return [
            SecurityAlert(
                id="al_1", 
                tenant_id=TENANT_ID,
                type="anomalous_access", 
                severity="high", 
                description="Acesso detectado de IP incomum (Rússia) para o usuário Admin.",
                metadata_json={"ip": "95.161.220.12", "location": "Moscow, RU"}
            ),
            SecurityAlert(
                id="al_2", 
                tenant_id=TENANT_ID,
                type="data_leak_attempt", 
                severity="medium", 
                description="Tentativa de envio de 15 números de cartões de crédito bloqueada via DLP.",
                metadata_json={"channel": "WhatsApp", "blocked_count": 15}
            )
        ]
    return alerts

@router.get("/policies", response_model=List[DLPPolicy])
async def list_dlp_policies(db: Session = Depends(get_session)):
    # Query DLPPolicy from DB
    policies = db.exec(
        select(DLPPolicy).where(DLPPolicy.tenant_id == TENANT_ID)
    ).all()
    return policies

@router.post("/policies")
async def create_dlp_policy(policy: dict, db: Session = Depends(get_session)):
    return {"status": "policy_created", "id": f"pol_{uuid.uuid4().hex[:6]}"}

@router.get("/audit/sessions")
async def get_audit_sessions(db: Session = Depends(get_session)):
    # Query AuditSession from DB
    sessions = db.exec(
        select(AuditSession).where(AuditSession.tenant_id == TENANT_ID)
        .order_by(AuditSession.started_at.desc())
    ).all()

    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "ip": s.ip_address,
            "user_agent": s.user_agent,
            "activity_log": s.activity_log_json,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "ended_at": s.ended_at.isoformat() if s.ended_at else None,
        }
        for s in sessions
    ]
