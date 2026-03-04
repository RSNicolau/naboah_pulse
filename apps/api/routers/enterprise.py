from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
from db import get_session
from models import Tenant
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/enterprise", tags=["enterprise"])

class EnterpriseUpdate(BaseModel):
    region_id: Optional[str] = None
    data_retention_days: Optional[int] = None
    ip_whitelist: Optional[str] = None

@router.get("/config", response_model=Tenant)
async def get_enterprise_config(db: Session = Depends(get_session)):
    tenant = db.exec(select(Tenant).where(Tenant.id == "tenant_123")).first() # Mock
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    return tenant

@router.patch("/config")
async def update_enterprise_config(data: EnterpriseUpdate, db: Session = Depends(get_session)):
    tenant = db.exec(select(Tenant).where(Tenant.id == "tenant_123")).first() # Mock
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant não encontrado")
    
    if data.region_id: tenant.region_id = data.region_id
    if data.data_retention_days is not None: tenant.data_retention_days = data.data_retention_days
    if data.ip_whitelist is not None: tenant.ip_whitelist = data.ip_whitelist
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return {"status": "updated", "config": tenant}

@router.get("/audit/export")
async def export_audit_siem(db: Session = Depends(get_session)):
    # Simula exportação SIEM formatada
    return {
        "format": "CEF (Common Event Format)",
        "destination": "SIEM Endpoint",
        "sample_payload": "CEF:0|Naboah|Pulse|1.0|LOGIN_SUCCESS|User logged in|5|src=192.168.1.1 dst=gateway"
    }
