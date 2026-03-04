from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import User
from auth_utils import create_access_token
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth/advanced", tags=["auth"])

class LoginSSO(BaseModel):
    provider: str
    id_token: str

class VerifyMFA(BaseModel):
    user_id: str
    code: str

@router.post("/sso/login")
async def sso_login(data: LoginSSO, db: Session = Depends(get_session)):
    # Mock de verificação de token SSO
    if data.provider not in ["google", "azure", "saml"]:
        raise HTTPException(status_code=400, detail="Provedor inválido")
    
    # Simulação de busca de usuário por SSO ID
    user = db.exec(select(User).where(User.sso_id == f"mock_{data.id_token}")).first()
    
    if not user:
        # No MVP, poderíamos auto-provisionar um usuário aqui
        raise HTTPException(status_code=404, detail="Usuário não vinculado ao SSO")
    
    if user.mfa_enabled:
        return {"require_mfa": True, "user_id": user.id}
    
    token = create_access_token(data={"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/mfa/verify")
async def verify_mfa(data: VerifyMFA, db: Session = Depends(get_session)):
    user = db.get(User, data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Mock de verificação de código (sempre 123456 no ambiente de dev)
    if data.code == "123456":
        token = create_access_token(data={"sub": user.email})
        return {"access_token": token, "token_type": "bearer"}
    
    raise HTTPException(status_code=401, detail="Código MFA inválido")

@router.get("/sessions")
async def get_active_sessions():
    # Mock de sessões ativas
    return [
        {"id": "sess_1", "device": "Chrome on macOS", "location": "São Paulo, BR", "current": True},
        {"id": "sess_2", "device": "Pulse App on iPhone", "location": "Rio de Janeiro, BR", "current": False},
    ]
