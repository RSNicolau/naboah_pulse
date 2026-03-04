from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import DeveloperApp, AppVersion, WebhookLog
from pydantic import BaseModel
from typing import List, Optional
import uuid
import secrets
from datetime import datetime

router = APIRouter(prefix="/developer", tags=["developer"])

class AppCreate(BaseModel):
    name: str
    description: Optional[str] = None
    redirect_uris: str

@router.post("/apps")
async def create_app(data: AppCreate, db: Session = Depends(get_session)):
    client_id = f"pub_{uuid.uuid4().hex[:12]}"
    client_secret = secrets.token_urlsafe(32)
    
    app = DeveloperApp(
        id=f"app_{uuid.uuid4().hex[:6]}",
        tenant_id="t1", # Mock
        name=data.name,
        description=data.description,
        client_id=client_id,
        client_secret_hash=client_secret, # Em prod: hash it
        redirect_uris=data.redirect_uris
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {**app.dict(), "client_secret": client_secret}

@router.get("/apps", response_model=List[DeveloperApp])
async def list_apps(db: Session = Depends(get_session)):
    return db.exec(select(DeveloperApp).where(DeveloperApp.tenant_id == "t1")).all()

@router.get("/webhooks/logs/{app_id}", response_model=List[WebhookLog])
async def get_webhook_logs(app_id: str, db: Session = Depends(get_session)):
    return db.exec(select(WebhookLog).where(WebhookLog.app_id == app_id).limit(50)).all()

@router.post("/apps/{app_id}/submit")
async def submit_app(app_id: str, db: Session = Depends(get_session)):
    app = db.get(DeveloperApp, app_id)
    if not app:
        raise HTTPException(status_code=404, detail="App not found")
    app.status = "pending_review"
    db.add(app)
    db.commit()
    return app
