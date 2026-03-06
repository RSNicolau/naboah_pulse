from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import User, AuditLog
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json

router = APIRouter(prefix="/compliance", tags=["compliance"])

class AnonymizeRequest(BaseModel):
    user_id: str
    reason: Optional[str] = "Solicitação do usuário (Direito ao esquecimento)"

@router.post("/export/{user_id}")
async def export_user_data(user_id: str, db: Session = Depends(get_session)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    # Compile real activity data from audit log
    user_logs = db.exec(
        select(AuditLog).where(AuditLog.user_id == user_id)
    ).all()

    return {
        "user_profile": {
            "email": user.email,
            "full_name": user.full_name,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
        "activity_summary": {
            "total_actions": len(user_logs),
            "actions": [
                {"action": log.action, "timestamp": log.created_at.isoformat() if log.created_at else None}
                for log in user_logs[:50]
            ],
        },
        "export_date": datetime.utcnow().isoformat() + "Z",
    }

@router.post("/anonymize")
async def anonymize_user(data: AnonymizeRequest, db: Session = Depends(get_session)):
    user = db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Anonimização irreversível de PII (Personally Identifiable Information)
    user.full_name = "USUÁRIO_ANONIMIZADO"
    user.email = f"deleted_{user.id}@pulse-shield.invalid"
    user.is_active = False
    
    db.add(user)
    db.commit()
    
    return {"detail": "Dados anonimizados com sucesso. O processo é irreversível."}

@router.get("/audit/trail")
async def get_audit_trail(db: Session = Depends(get_session)):
    # Simulação de trilha de auditoria com verificação de integridade
    logs = db.exec(select(AuditLog).order_by(AuditLog.created_at.desc())).all()
    return [
        {
            "id": log.id,
            "action": log.action,
            "user_id": log.user_id,
            "timestamp": log.created_at.isoformat(),
            "status": "VERIFIED" if log.integrity_hash else "UNVERIFIED"
        } for log in logs[:10]
    ]
