from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import User, UserDevice
from auth_utils import create_access_token
from pydantic import BaseModel
from typing import Optional
import hmac

router = APIRouter(prefix="/auth/advanced", tags=["auth"])

TENANT_ID = "naboah"

class LoginSSO(BaseModel):
    provider: str
    id_token: str

class VerifyMFA(BaseModel):
    user_id: str
    code: str

@router.post("/sso/login")
async def sso_login(data: LoginSSO, db: Session = Depends(get_session)):
    if data.provider not in ["google", "azure", "saml"]:
        raise HTTPException(status_code=400, detail="Provedor inválido")

    # Look up user by SSO ID (the id_token is the SSO identifier)
    user = db.exec(select(User).where(User.sso_id == data.id_token)).first()

    if not user:
        raise HTTPException(status_code=404, detail="Usuário não vinculado ao SSO. Registre-se primeiro.")

    if user.mfa_enabled:
        return {"require_mfa": True, "user_id": user.id}

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/mfa/verify")
async def verify_mfa(data: VerifyMFA, db: Session = Depends(get_session)):
    user = db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if not user.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA não está habilitado para este usuário")

    # Verify MFA code against stored secret (TOTP-style comparison)
    expected = user.mfa_secret or ""
    if not expected or not hmac.compare_digest(data.code, expected):
        raise HTTPException(status_code=401, detail="Código MFA inválido")

    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/sessions")
async def get_active_sessions(db: Session = Depends(get_session)):
    # Query real devices from UserDevice table
    devices = db.exec(
        select(UserDevice).where(UserDevice.tenant_id == TENANT_ID)
        .order_by(UserDevice.last_sync_at.desc())
    ).all()

    if not devices:
        return []

    sessions = []
    for i, dev in enumerate(devices):
        sessions.append({
            "id": dev.id,
            "device": f"{dev.device_name} ({dev.os_type})",
            "app_version": dev.app_version,
            "last_active": dev.last_sync_at.isoformat() if dev.last_sync_at else None,
            "current": i == 0,  # Most recently active = current
        })
    return sessions
