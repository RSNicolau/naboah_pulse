from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from db import get_session
from models import Tenant
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/settings", tags=["settings"])

TENANT_ID = "naboah"


class BrandingUpdate(BaseModel):
    primary_color: Optional[str] = None
    ai_name: Optional[str] = None
    logo_url: Optional[str] = None
    custom_domain: Optional[str] = None


@router.get("/branding")
async def get_branding(db: Session = Depends(get_session)):
    tenant = db.get(Tenant, TENANT_ID)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {
        "primary_color": tenant.primary_color,
        "ai_name": tenant.ai_persona_config.get("name", "Jarvis"),
        "logo_url": tenant.logo_url,
        "custom_domain": tenant.custom_domain,
    }


@router.patch("/branding")
async def update_branding(req: BrandingUpdate, db: Session = Depends(get_session)):
    tenant = db.get(Tenant, TENANT_ID)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    if req.primary_color is not None:
        tenant.primary_color = req.primary_color
    if req.logo_url is not None:
        tenant.logo_url = req.logo_url
    if req.custom_domain is not None:
        tenant.custom_domain = req.custom_domain
    if req.ai_name is not None:
        config = dict(tenant.ai_persona_config)
        config["name"] = req.ai_name
        tenant.ai_persona_config = config

    from datetime import datetime
    tenant.updated_at = datetime.utcnow()
    db.add(tenant)
    db.commit()
    db.refresh(tenant)

    return {
        "primary_color": tenant.primary_color,
        "ai_name": tenant.ai_persona_config.get("name", "Jarvis"),
        "logo_url": tenant.logo_url,
        "custom_domain": tenant.custom_domain,
    }
