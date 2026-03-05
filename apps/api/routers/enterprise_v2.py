from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import AuditStreamConfig, RegionHealth
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/enterprise", tags=["enterprise"])

TENANT_ID = "naboah"

@router.get("/health/global")
async def get_global_health(db: Session = Depends(get_session)):
    # Query RegionHealth table
    regions = db.exec(select(RegionHealth)).all()

    if not regions:
        return {
            "status": "unknown",
            "regions": [],
            "last_update": datetime.utcnow(),
        }

    region_list = [
        {
            "id": r.id,
            "name": r.region_name,
            "status": r.status,
            "latency_ms": r.latency_ms,
            "load_percentage": r.load_percentage,
            "last_check_at": r.last_check_at.isoformat() if r.last_check_at else None,
        }
        for r in regions
    ]

    # Overall status: degraded if any region is degraded, down if any is down
    statuses = [r.status for r in regions]
    if "down" in statuses:
        overall = "critical"
    elif "degraded" in statuses:
        overall = "degraded"
    else:
        overall = "healthy"

    return {
        "status": overall,
        "regions": region_list,
        "last_update": datetime.utcnow(),
    }

@router.post("/audit-stream/config")
async def update_audit_config(config: AuditStreamConfig, db: Session = Depends(get_session)):
    db.add(config)
    db.commit()
    db.refresh(config)
    return config

@router.get("/audit-stream/status")
async def get_stream_status(db: Session = Depends(get_session)):
    # Query AuditStreamConfig for this tenant
    config = db.exec(
        select(AuditStreamConfig).where(AuditStreamConfig.tenant_id == TENANT_ID)
    ).first()

    if not config:
        return {
            "connected": False,
            "destination_url": None,
            "is_active": False,
            "event_filters": "*",
            "last_event_at": None,
        }

    return {
        "connected": config.is_active,
        "destination_url": config.destination_url,
        "is_active": config.is_active,
        "event_filters": config.event_filters,
        "created_at": config.created_at.isoformat() if config.created_at else None,
    }

@router.post("/failover/trigger")
async def trigger_failover(target_region: str, db: Session = Depends(get_session)):
    # Find the RegionHealth record for the target region
    region = db.exec(
        select(RegionHealth).where(RegionHealth.region_name == target_region)
    ).first()

    if not region:
        raise HTTPException(status_code=404, detail=f"Region '{target_region}' not found")

    # Update status to failover
    region.status = "failover"
    region.last_check_at = datetime.utcnow()
    db.add(region)
    db.commit()
    db.refresh(region)

    return {
        "status": "initiated",
        "target": region.region_name,
        "region_id": region.id,
        "previous_status": "operational",
        "current_status": region.status,
        "latency_ms": region.latency_ms,
        "load_percentage": region.load_percentage,
        "estimated_rto": "45s",
        "started_at": datetime.utcnow(),
    }
