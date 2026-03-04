from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Deal, PipelineStage
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/sales", tags=["sales"])

TENANT_ID = "naboah"

DEFAULT_STAGES = [
    {"id": "stg_1", "name": "Lead Qualificado", "order": 1, "color": "#7B61FF"},
    {"id": "stg_2", "name": "Apresentação",      "order": 2, "color": "#8B5CF6"},
    {"id": "stg_3", "name": "Negociação",        "order": 3, "color": "#F59E0B"},
    {"id": "stg_4", "name": "Fechamento",        "order": 4, "color": "#22C55E"},
]


class DealCreate(BaseModel):
    title: str
    value: float
    stage_id: str
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None


def ensure_stages(db: Session) -> List[PipelineStage]:
    stages = db.exec(select(PipelineStage).order_by(PipelineStage.order)).all()
    if stages:
        return stages
    # Persist default stages on first call
    created = []
    for s in DEFAULT_STAGES:
        stage = PipelineStage(
            id=s["id"],
            tenant_id=TENANT_ID,
            name=s["name"],
            order=s["order"],
            color=s["color"],
        )
        db.add(stage)
        created.append(stage)
    try:
        db.commit()
    except Exception:
        db.rollback()
        # If FK fails (tenant missing), return mock without persisting
        return [
            PipelineStage(id=s["id"], tenant_id=TENANT_ID, name=s["name"], order=s["order"], color=s["color"])
            for s in DEFAULT_STAGES
        ]
    return created


@router.get("/stages")
async def list_stages(db: Session = Depends(get_session)):
    return ensure_stages(db)


@router.get("/deals")
async def list_deals(db: Session = Depends(get_session)):
    ensure_stages(db)  # guarantee stages exist before deals query
    deals = db.exec(select(Deal).order_by(Deal.created_at.desc())).all()
    return deals


@router.post("/deals")
async def create_deal(data: DealCreate, db: Session = Depends(get_session)):
    ensure_stages(db)
    new_deal = Deal(
        id=f"deal_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        title=data.title,
        value=data.value,
        stage_id=data.stage_id,
        contact_name=data.contact_name,
        contact_email=data.contact_email,
        lead_score=max(50, min(99, int(data.value / 500))),  # simple score heuristic
    )
    db.add(new_deal)
    db.commit()
    db.refresh(new_deal)
    return new_deal


@router.patch("/deals/{deal_id}/stage")
async def update_deal_stage(deal_id: str, stage_id: str, db: Session = Depends(get_session)):
    deal = db.get(Deal, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal não encontrado")
    deal.stage_id = stage_id
    deal.updated_at = datetime.utcnow()
    db.add(deal)
    db.commit()
    return {"status": "updated", "deal_id": deal_id, "new_stage": stage_id}


@router.delete("/deals/{deal_id}")
async def delete_deal(deal_id: str, db: Session = Depends(get_session)):
    deal = db.get(Deal, deal_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal não encontrado")
    db.delete(deal)
    db.commit()
    return {"status": "deleted", "deal_id": deal_id}
