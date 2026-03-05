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
    # Mock de apps padrão se nenhum existir
    apps = db.exec(select(App).where(App.is_public == True)).all()
    if not apps:
        return [
            App(id="app_1", name="WhatsApp Business Pro", description="Integração avançada com API oficial.", developer_name="Meta", category="Messaging", is_official=True),
            App(id="app_2", name="Slack Sync", description="Sincronize conversas para canais do Slack.", developer_name="Slack", category="Collaboration"),
            App(id="app_3", name="Jarvis Content Writer", description="Geração de posts via IA Turbo.", developer_name="Naboah Pulse", category="AI", is_official=True),
            App(id="app_4", name="Google Sheets Export", description="Exporte deals e tickets para planilhas.", developer_name="Google", category="Utility"),
        ]
    return apps

@router.post("/install/{app_id}")
async def install_app(app_id: str, db: Session = Depends(get_session)):
    app = db.get(App, app_id)
    # No mock, deixamos passar se o ID for app_X
    
    new_install = AppInstallation(
        id=f"inst_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID, # Mock
        app_id=app_id,
        installed_by_id="user_admin", # Mock
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
