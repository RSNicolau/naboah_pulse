from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import AuditStreamConfig, RegionHealth
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/enterprise", tags=["enterprise"])

# Mock de regiões globais
REGIONS = [
    {"id": "reg_1", "name": "sa-east-1 (São Paulo)", "status": "operational", "latency": 12},
    {"id": "reg_2", "name": "us-east-1 (N. Virginia)", "status": "operational", "latency": 115},
    {"id": "reg_3", "name": "eu-west-1 (Ireland)", "status": "degraded", "latency": 240},
]

@router.get("/health/global")
async def get_global_health():
    return {
        "status": "healthy",
        "regions": REGIONS,
        "last_update": datetime.utcnow()
    }

@router.post("/audit-stream/config")
async def update_audit_config(config: AuditStreamConfig, db: Session = Depends(get_session)):
    db.add(config)
    db.commit()
    db.refresh(config)
    return config

@router.get("/audit-stream/status")
async def get_stream_status():
    return {
        "connected": True,
        "events_streamed": 145020,
        "failed_delivery": 0,
        "last_event_at": datetime.utcnow()
    }

@router.post("/failover/trigger")
async def trigger_failover(target_region: str):
    # Simulação de failover manual
    return {
        "status": "initiated",
        "target": target_region,
        "estimated_rto": "45s",
        "started_at": datetime.utcnow()
    }
