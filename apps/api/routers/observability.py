from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from db import get_session
from models import AICostLog, AssetAuditLog, MediaAsset, AssetBackupConfig
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/creative/observability", tags=["observability"])

@router.get("/costs")
async def get_costs(db: Session = Depends(get_session)):
    TENANT_ID = "naboah"

    # Aggregate from AICostLog
    cost_logs = db.exec(select(AICostLog).where(AICostLog.tenant_id == TENANT_ID)).all()

    if not cost_logs:
        return {
            "daily_burn": 0,
            "monthly_total": 0,
            "by_provider": [],
        }

    total_cost = sum(log.estimated_cost_usd for log in cost_logs)

    # Group by provider
    provider_data: dict = {}
    for log in cost_logs:
        p = log.provider
        if p not in provider_data:
            provider_data[p] = {"provider": p, "cost": 0.0, "tokens": 0, "pixels": 0}
        provider_data[p]["cost"] += log.estimated_cost_usd
        provider_data[p]["tokens"] += log.tokens_used
        provider_data[p]["pixels"] += log.pixels_generated

    # Estimate daily burn (total / 30)
    daily_burn = round(total_cost / 30, 2)

    return {
        "daily_burn": daily_burn,
        "monthly_total": round(total_cost, 2),
        "by_provider": list(provider_data.values()),
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
    TENANT_ID = "naboah"

    # Count media assets
    assets = db.exec(select(MediaAsset).where(MediaAsset.tenant_id == TENANT_ID)).all()
    assets_total = len(assets)

    # Asset type breakdown
    type_counts: dict[str, int] = {}
    for a in assets:
        type_counts[a.asset_type] = type_counts.get(a.asset_type, 0) + 1

    # Query backup config
    backup_config = db.exec(
        select(AssetBackupConfig).where(AssetBackupConfig.tenant_id == TENANT_ID)
    ).first()

    if backup_config:
        backup_status = "Healthy" if backup_config.replication_enabled else "No Replication"
        last_backup = backup_config.last_backup_at.isoformat() if backup_config.last_backup_at else None
        backup_info = {
            "provider": backup_config.provider,
            "region": backup_config.region,
            "bucket": backup_config.bucket_name,
            "retention_days": backup_config.retention_days,
        }
    else:
        backup_status = "Not Configured"
        last_backup = None
        backup_info = {}

    return {
        "assets_total": assets_total,
        "assets_by_type": type_counts,
        "backup_status": backup_status,
        "last_backup": last_backup,
        "backup_config": backup_info,
    }
