from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import App, AppInstallation
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

TENANT_ID = "naboah"

class AppCreate(BaseModel):
    name: str
    description: str
    category: str
    developer_name: str

@router.get("/apps", response_model=List[App])
async def list_available_apps(db: Session = Depends(get_session)):
    apps = db.exec(select(App).where(App.is_public == True)).all()
    return apps

@router.post("/install/{app_id}")
async def install_app(app_id: str, db: Session = Depends(get_session)):
    app = db.get(App, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="App not found")

    # Check if already installed
    existing = db.exec(
        select(AppInstallation)
        .where(AppInstallation.tenant_id == TENANT_ID)
        .where(AppInstallation.app_id == app_id)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="App already installed")

    new_install = AppInstallation(
        id=f"inst_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        app_id=app_id,
        installed_by_id="user_admin",
        is_enabled=True
    )
    db.add(new_install)
    db.commit()
    return {"status": "installed", "installation_id": new_install.id}

@router.get("/my-apps")
async def list_installed_apps(db: Session = Depends(get_session)):
    # Query AppInstallation + App for the tenant
    installations = db.exec(
        select(AppInstallation).where(AppInstallation.tenant_id == TENANT_ID)
    ).all()

    result = []
    for inst in installations:
        app = db.get(App, inst.app_id)
        result.append({
            "installation_id": inst.id,
            "app_id": inst.app_id,
            "name": app.name if app else "Unknown App",
            "description": app.description if app else "",
            "category": app.category if app else "",
            "status": "active" if inst.is_enabled else "disabled",
            "installed_at": inst.installed_at.isoformat() if inst.installed_at else None,
        })

    return result
