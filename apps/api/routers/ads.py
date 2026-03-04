from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import AdAccount, AdCampaign, BudgetAllocation, MediaAsset
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

router = APIRouter(prefix="/ads", tags=["ads"])

@router.get("/accounts")
async def list_accounts(db: Session = Depends(get_session)):
    return db.exec(select(AdAccount)).all()

class CampaignDeploy(BaseModel):
    account_id: str
    asset_id: str
    name: str
    budget: float

@router.post("/campaigns/deploy")
async def deploy_campaign(req: CampaignDeploy, db: Session = Depends(get_session)):
    campaign = AdCampaign(
        id=f"cmp_{uuid.uuid4().hex[:6]}",
        tenant_id="t1",
        ad_account_id=req.account_id,
        asset_id=req.asset_id,
        name=req.name,
        budget=req.budget,
        status="active"
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign

@router.get("/performance")
async def get_performance(db: Session = Depends(get_session)):
    # Mock data for performance dashboard
    return {
        "total_spend": 12500.0,
        "avg_roas": 4.25,
        "platforms": [
            {"name": "Meta", "spend": 6000, "roas": 4.8},
            {"name": "Google", "spend": 4500, "roas": 3.5},
            {"name": "TikTok", "spend": 2000, "roas": 4.1}
        ]
    }

@router.post("/budget/optimize")
async def optimize_budget(db: Session = Depends(get_session)):
    # Mock AI optimization result
    return {
        "recommendation": "Increase Meta budget by 15%, Reduce Google by 10%",
        "expected_roas_lift": "+0.4",
        "rationale": "Meta creatives are currently generating 20% higher CTR in the core demographic."
    }
