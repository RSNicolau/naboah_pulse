from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import APIKey
from pydantic import BaseModel
from typing import List, Optional
import secrets
import hashlib
from datetime import datetime, timedelta

router = APIRouter(prefix="/apihub", tags=["apihub"])

TENANT_ID = "naboah"

class APIKeyCreate(BaseModel):
    name: str
    scopes: Optional[str] = "read,write"
    expires_in_days: Optional[int] = 30

class APIKeyRead(BaseModel):
    id: str
    name: str
    scopes: str
    created_at: datetime
    last_used: Optional[datetime]
    is_active: bool

@router.post("/keys", response_model=dict)
async def create_api_key(data: APIKeyCreate, db: Session = Depends(get_session)):
    # No mundo real, tenant_id viria do token de admin
    tenant_id = TENANT_ID
    
    raw_key = f"pulse_live_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    new_key = APIKey(
        id=f"key_{secrets.token_hex(4)}",
        tenant_id=tenant_id,
        key_hash=key_hash,
        name=data.name,
        scopes=data.scopes,
        expires_at=datetime.utcnow() + timedelta(days=data.expires_in_days)
    )
    
    db.add(new_key)
    db.commit()
    
    return {
        "api_key": raw_key,
        "detail": "Guarde esta chave em um lugar seguro. Ela não será exibida novamente."
    }

@router.get("/keys", response_model=List[APIKeyRead])
async def list_api_keys(db: Session = Depends(get_session)):
    tenant_id = TENANT_ID
    keys = db.exec(select(APIKey).where(APIKey.tenant_id == tenant_id)).all()
    return keys

@router.delete("/keys/{key_id}")
async def revoke_api_key(key_id: str, db: Session = Depends(get_session)):
    key = db.get(APIKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="Chave não encontrada")
    
    db.delete(key)
    db.commit()
    return {"detail": "Chave revogada com sucesso"}

@router.get("/logs")
async def get_api_logs():
    # Mock de logs de requisições de API
    return [
        {"id": 1, "method": "POST", "path": "/messages/send", "status": 200, "timestamp": "2026-03-03 21:00:05", "ip": "45.12.33.1"},
        {"id": 2, "method": "GET", "path": "/analytics/summary", "status": 200, "timestamp": "2026-03-03 20:45:12", "ip": "45.12.33.1"},
        {"id": 3, "method": "POST", "path": "/messages/send", "status": 401, "timestamp": "2026-03-03 20:30:00", "ip": "123.4.5.6"},
    ]
