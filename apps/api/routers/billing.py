from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from db import get_session
from models import SubscriptionPlan, UsageQuota, CreditTransaction
from datetime import datetime, timedelta

router = APIRouter(prefix="/billing", tags=["billing"])

TENANT_ID = "naboah"

def ensure_billing(db: Session):
    """Create default plan + quota for naboah if not present."""
    plan = db.get(SubscriptionPlan, "plan_pro")
    if not plan:
        plan = SubscriptionPlan(
            id="plan_pro",
            name="Pro",
            price_monthly=199.0,
            price_yearly=1990.0,
            features_json={"agents": 10, "messages": 50000, "ai_credits": 1000},
            max_agents=10,
            max_messages_monthly=50000,
            is_active=True,
        )
        db.add(plan)

        for p in [
            SubscriptionPlan(
                id="plan_starter",
                name="Starter",
                price_monthly=49.0,
                price_yearly=490.0,
                features_json={"agents": 2, "messages": 10000, "ai_credits": 200},
                max_agents=2,
                max_messages_monthly=10000,
                is_active=True,
            ),
            SubscriptionPlan(
                id="plan_enterprise",
                name="Enterprise",
                price_monthly=0.0,
                price_yearly=0.0,
                features_json={"agents": -1, "messages": -1, "ai_credits": -1},
                max_agents=999,
                max_messages_monthly=999999,
                is_active=True,
            ),
        ]:
            if not db.get(SubscriptionPlan, p.id):
                db.add(p)

    quota = db.exec(select(UsageQuota).where(UsageQuota.tenant_id == TENANT_ID)).first()
    if not quota:
        now = datetime.utcnow()
        quota = UsageQuota(
            id=f"quota_{TENANT_ID}",
            tenant_id=TENANT_ID,
            plan_id="plan_pro",
            current_period_start=now.replace(day=1),
            current_period_end=(now.replace(day=1) + timedelta(days=32)).replace(day=1),
            messages_sent=12402,
            ai_credits_remaining=160.0,
            status="active",
        )
        db.add(quota)

        for tx in [
            CreditTransaction(
                id="tx_naboah_mar26",
                tenant_id=TENANT_ID,
                amount=-199.0,
                type="usage",
                description="Pro Plan - Março 2026",
                created_at=datetime(2026, 3, 2),
            ),
            CreditTransaction(
                id="tx_naboah_feb26b",
                tenant_id=TENANT_ID,
                amount=-50.0,
                type="purchase",
                description="Recarga de créditos (500)",
                created_at=datetime(2026, 2, 26),
            ),
            CreditTransaction(
                id="tx_naboah_feb26",
                tenant_id=TENANT_ID,
                amount=-199.0,
                type="usage",
                description="Pro Plan - Fevereiro 2026",
                created_at=datetime(2026, 2, 2),
            ),
        ]:
            db.add(tx)

    db.commit()
    db.refresh(quota)
    return quota


@router.get("/plans")
async def list_plans(db: Session = Depends(get_session)):
    ensure_billing(db)
    return db.exec(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True)).all()


@router.get("/status")
async def get_usage_status(db: Session = Depends(get_session)):
    quota = ensure_billing(db)
    plan = db.get(SubscriptionPlan, quota.plan_id)
    return {
        "quota": quota,
        "plan": plan,
    }


@router.get("/transactions")
async def list_transactions(db: Session = Depends(get_session)):
    txs = db.exec(
        select(CreditTransaction)
        .where(CreditTransaction.tenant_id == TENANT_ID)
        .order_by(CreditTransaction.created_at.desc())
    ).all()
    return txs
