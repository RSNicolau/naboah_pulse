from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import UserDevice
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/desktop", tags=["desktop"])

TENANT_ID = "naboah"

class DeviceRegister(BaseModel):
    device_name: str
    os_type: str
    app_version: str

@router.post("/register")
async def register_device(data: DeviceRegister, db: Session = Depends(get_session)):
    device = UserDevice(
        id=f"dev_{uuid.uuid4().hex[:6]}",
        user_id="u1", # Mock
        tenant_id=TENANT_ID, # Mock
        device_name=data.device_name,
        os_type=data.os_type,
        app_version=data.app_version
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device

@router.get("/config")
async def get_desktop_config():
    # Configurações para o app nativo (atalhos, tray, etc)
    return {
        "global_shortcuts": {
            "invoke_jarvis": "Command+Shift+P",
            "quick_capture": "Command+Shift+K",
            "toggle_huddle": "Command+Shift+H"
        },
        "tray_enabled": True,
        "offline_sync": {
            "enabled": True,
            "interval_minutes": 5,
            "max_storage_mb": 500
        }
    }

@router.post("/sync/offline")
async def sync_offline_payload(payload: dict):
    # Simulação de recepção de dados sincronizados offline
    return {"status": "success", "synced_items": len(payload.get("items", []))}
