from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from db import get_session
from models import Tenant, AuditLog
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/enterprise", tags=["enterprise"])

TENANT_ID = "naboah"

class EnterpriseUpdate(BaseModel):
    name: Optional[str] = None
    primary_color: Optional[str] = None
    custom_domain: Optional[str] = None
    ai_persona_config: Optional[dict] = None

@router.get("/config", response_model=Tenant)
async def get_enterprise_config(db: Session = Depends(get_session)):
    tenant = db.exec(select(Tenant).where(Tenant.id == TENANT_ID)).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    return tenant

@router.patch("/config")
async def update_enterprise_config(data: EnterpriseUpdate, db: Session = Depends(get_session)):
    tenant = db.exec(select(Tenant).where(Tenant.id == TENANT_ID)).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")

    if data.name is not None:
        tenant.name = data.name
    if data.primary_color is not None:
        tenant.primary_color = data.primary_color
    if data.custom_domain is not None:
        tenant.custom_domain = data.custom_domain
    if data.ai_persona_config is not None:
        tenant.ai_persona_config = data.ai_persona_config

    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return {"status": "updated", "config": tenant}

@router.get("/tenants")
async def list_tenants(db: Session = Depends(get_session)):
    """List all tenants (filtered by current tenant)."""
    tenants = db.exec(select(Tenant).where(Tenant.id == TENANT_ID)).all()
    return tenants

@router.get("/audit/export")
async def export_audit_siem(db: Session = Depends(get_session)):
    logs = db.exec(
        select(AuditLog)
        .where(AuditLog.tenant_id == TENANT_ID)
        .order_by(AuditLog.created_at.desc())
        .limit(100)
    ).all()

    cef_events = []
    for log in logs:
        cef_line = (
            f"CEF:0|Naboah|Pulse|1.0|{log.action}|"
            f"{log.entity_type}.{log.entity_id}|"
            f"{int((log.risk_score or 0) * 10)}|"
            f"actor={log.actor_type}:{log.actor_id} "
            f"entity={log.entity_type}:{log.entity_id}"
        )
        cef_events.append({
            "id": log.id,
            "cef": cef_line,
            "action": log.action,
            "actor": f"{log.actor_type}:{log.actor_id}",
            "entity": f"{log.entity_type}:{log.entity_id}",
            "risk_score": log.risk_score,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })

    return {
        "format": "CEF (Common Event Format)",
        "destination": "SIEM Endpoint",
        "total_events": len(cef_events),
        "events": cef_events,
    }
