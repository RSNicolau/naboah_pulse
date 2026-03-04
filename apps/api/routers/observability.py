from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from db import get_session
from models import AICostLog, AssetAuditLog, MediaAsset
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/creative/observability", tags=["observability"])

@router.get("/costs")
async def get_costs(db: Session = Depends(get_session)):
    # Aggregated mock costs
    return {
        "daily_burn": 145.20,
        "monthly_total": 3840.50,
        "by_provider": [
            {"provider": "OpenAI", "cost": 1200.00, "tokens": 85000000},
            {"provider": "Midjourney", "cost": 850.00, "pixels": 120000000},
            {"provider": "ElevenLabs", "cost": 420.00, "seconds": 15000}
        ]
    }

@router.get("/audit/{asset_id}")
async def get_asset_audit(asset_id: str, db: Session = Depends(get_session)):
    return db.exec(select(AssetAuditLog).where(AssetAuditLog.asset_id == asset_id)).all()

@router.post("/rollback")
async def rollback_asset(asset_id: str, version_id: str, db: Session = Depends(get_session)):
    # Mock rollback logic
    return {
        "status": "success",
        "asset_id": asset_id,
        "restored_to": version_id,
        "message": "Asset version successfully restored."
    }

@router.get("/health")
async def get_creative_health(db: Session = Depends(get_session)):
    return {
        "assets_total": 4520,
        "storage_used": "1.2 TB",
        "backup_status": "Healthy",
        "last_backup": (datetime.utcnow() - timedelta(hours=2)).isoformat()
    }
