from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Tenant, Membership, Role
from typing import List

router = APIRouter(prefix="/tenants", tags=["tenants"])

@router.post("/")
async def create_tenant(tenant_data: dict, db: Session = Depends(get_session)):
    new_tenant = Tenant(
        id=tenant_data["slug"],
        name=tenant_data["name"],
        plan=tenant_data.get("plan", "free")
    )
    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)
    return new_tenant

@router.get("/")
async def list_tenants(db: Session = Depends(get_session)):
    query = select(Tenant)
    tenants = db.exec(query).all()
    return tenants

@router.patch("/{tenant_id}/domain")
async def update_custom_domain(tenant_id: str, domain: str, db: Session = Depends(get_session)):
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    tenant.custom_domain = domain
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant
