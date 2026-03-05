from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import AdAccount, AdCampaign, BudgetAllocation, MediaAsset
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

router = APIRouter(prefix="/ads", tags=["ads"])

TENANT_ID = "naboah"

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
        tenant_id=TENANT_ID,
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
    # Aggregate from AdCampaign.performance_metrics_json
    campaigns = db.exec(
        select(AdCampaign).where(AdCampaign.tenant_id == TENANT_ID)
    ).all()

    if not campaigns:
        return {"total_spend": 0, "avg_roas": 0, "platforms": [], "total_campaigns": 0}

    total_spend = sum(c.budget for c in campaigns)

    # Group by platform (via ad_account)
    platform_data: dict[str, dict] = {}
    roas_values = []
    for c in campaigns:
        account = db.get(AdAccount, c.ad_account_id)
        platform = account.platform if account else "unknown"

        metrics = c.performance_metrics_json or {}
        roas = metrics.get("roas", 0)
        spend = metrics.get("spend", c.budget)
        impressions = metrics.get("impressions", 0)

        if roas:
            roas_values.append(roas)

        if platform not in platform_data:
            platform_data[platform] = {"name": platform, "spend": 0, "roas": 0, "campaigns": 0, "impressions": 0}
        platform_data[platform]["spend"] += spend
        platform_data[platform]["campaigns"] += 1
        platform_data[platform]["impressions"] += impressions

    # Calculate avg ROAS per platform
    for p_key in platform_data:
        p_campaigns = [c for c in campaigns if (db.get(AdAccount, c.ad_account_id) and db.get(AdAccount, c.ad_account_id).platform == p_key)]
        p_roas = [
            (c.performance_metrics_json or {}).get("roas", 0)
            for c in p_campaigns
            if (c.performance_metrics_json or {}).get("roas")
        ]
        platform_data[p_key]["roas"] = round(sum(p_roas) / max(len(p_roas), 1), 2)

    avg_roas = round(sum(roas_values) / max(len(roas_values), 1), 2)

    return {
        "total_spend": round(total_spend, 2),
        "avg_roas": avg_roas,
        "total_campaigns": len(campaigns),
        "platforms": list(platform_data.values()),
    }

@router.post("/budget/optimize")
async def optimize_budget(db: Session = Depends(get_session)):
    # Query BudgetAllocation for this tenant
    allocations = db.exec(
        select(BudgetAllocation).where(BudgetAllocation.tenant_id == TENANT_ID)
        .order_by(BudgetAllocation.month.desc())
    ).all()

    if not allocations:
        return {
            "allocations": [],
            "recommendation": "Nenhuma alocacao de budget encontrada. Crie campanhas primeiro.",
            "expected_roas_lift": "N/A",
        }

    # Build recommendations based on performance scores
    sorted_allocs = sorted(allocations, key=lambda a: a.performance_score, reverse=True)

    recommendations = []
    for alloc in sorted_allocs:
        if alloc.performance_score >= 0.7:
            action = f"Aumentar budget em {alloc.platform}"
        elif alloc.performance_score <= 0.3:
            action = f"Reduzir budget em {alloc.platform}"
        else:
            action = f"Manter budget em {alloc.platform}"

        recommendations.append({
            "platform": alloc.platform,
            "current_amount": alloc.amount,
            "month": alloc.month,
            "performance_score": alloc.performance_score,
            "strategy": alloc.strategy_json,
            "action": action,
        })

    return {
        "allocations": recommendations,
        "recommendation": recommendations[0]["action"] if recommendations else "Sem dados",
        "top_performer": sorted_allocs[0].platform if sorted_allocs else None,
    }
