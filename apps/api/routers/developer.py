from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import DeveloperApp, AppVersion, WebhookLog
from pydantic import BaseModel
from typing import List, Optional
import uuid
import secrets
import hashlib
import hmac
import json
import base64
from datetime import datetime, timedelta

router = APIRouter(prefix="/developer", tags=["developer"])

TENANT_ID = "naboah"

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
        tenant_id=TENANT_ID, # Mock
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
    return db.exec(select(DeveloperApp).where(DeveloperApp.tenant_id == TENANT_ID)).all()

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


# ─────────────────────────────────────────────
# OAuth2 Client Credentials → JWT
# ─────────────────────────────────────────────

JWT_SECRET = secrets.token_urlsafe(32)  # In prod: load from env
JWT_TTL_HOURS = 1


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _create_jwt(payload: dict) -> str:
    header = _b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    body = _b64url(json.dumps(payload).encode())
    sig = hmac.new(JWT_SECRET.encode(), f"{header}.{body}".encode(), hashlib.sha256).digest()
    return f"{header}.{body}.{_b64url(sig)}"


class TokenRequest(BaseModel):
    client_id: str
    client_secret: str
    grant_type: str = "client_credentials"


@router.post("/oauth/token", tags=["oauth"])
async def oauth_token(data: TokenRequest, db: Session = Depends(get_session)):
    if data.grant_type != "client_credentials":
        raise HTTPException(status_code=400, detail="Unsupported grant_type")

    app = db.exec(
        select(DeveloperApp).where(
            DeveloperApp.client_id == data.client_id,
            DeveloperApp.tenant_id == TENANT_ID,
        )
    ).first()

    if not app or app.client_secret_hash != data.client_secret:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    now = int(datetime.utcnow().timestamp())
    token = _create_jwt({
        "sub": app.id,
        "tenant_id": app.tenant_id,
        "app_id": app.id,
        "scopes": ["crm.read", "crm.write", "content.read"],
        "iat": now,
        "exp": now + (JWT_TTL_HOURS * 3600),
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_TTL_HOURS * 3600,
    }
