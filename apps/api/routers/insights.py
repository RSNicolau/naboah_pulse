from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import BusinessForecast, Contact
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter(prefix="/insights", tags=["insights"])

TENANT_ID = "naboah"

@router.get("/revenue-forecast")
async def get_revenue_forecast(db: Session = Depends(get_session)):
    # Query BusinessForecast where type="revenue" for this tenant
    forecasts = db.exec(
        select(BusinessForecast).where(
            BusinessForecast.tenant_id == TENANT_ID,
            BusinessForecast.type == "revenue"
        ).order_by(BusinessForecast.period_start.asc())
    ).all()

    if not forecasts:
        return {
            "scenario": "no_data",
            "predicted_revenue_30d": 0,
            "growth_rate_projected": "0%",
            "confidence": 0,
            "data_points": []
        }

    total_predicted = sum(f.predicted_value for f in forecasts)
    avg_confidence = sum(f.confidence_score for f in forecasts) / len(forecasts)

    # Build data points from forecasts
    data_points = [
        {
            "date": f.period_start.strftime("%Y-%m-%d"),
            "value": f.predicted_value,
            "actual": f.actual_value,
            "confidence": f.confidence_score,
        }
        for f in forecasts
    ]

    # Calculate growth rate if we have actual vs predicted
    actuals = [f for f in forecasts if f.actual_value is not None]
    if len(actuals) >= 2:
        first_val = actuals[0].actual_value
        last_val = actuals[-1].actual_value
        if first_val and first_val > 0:
            growth = round((last_val - first_val) / first_val * 100, 1)
            growth_str = f"+{growth}%" if growth > 0 else f"{growth}%"
        else:
            growth_str = "N/A"
    else:
        growth_str = "N/A"

    return {
        "scenario": "data_driven",
        "predicted_revenue_30d": round(total_predicted, 2),
        "growth_rate_projected": growth_str,
        "confidence": round(avg_confidence, 2),
        "data_points": data_points
    }

@router.get("/churn-risk")
async def get_churn_risk(db: Session = Depends(get_session)):
    # Query contacts with medium or high churn risk
    at_risk = db.exec(
        select(Contact).where(
            Contact.tenant_id == TENANT_ID,
            Contact.churn_risk_level.in_(["medium", "high"])
        )
    ).all()

    result = []
    for c in at_risk:
        reasons = []
        if c.churn_risk_level == "high":
            reasons.append("Alto risco de churn detectado pela IA")
        if c.health_score is not None and c.health_score < 50:
            reasons.append(f"Health score baixo: {c.health_score}")
        if c.predicted_ltv is not None and c.predicted_ltv < 100:
            reasons.append("LTV previsto muito baixo")
        if not reasons:
            reasons.append("Risco moderado identificado")

        result.append({
            "contact_id": c.id,
            "name": c.name or c.email or "Desconhecido",
            "risk": c.churn_risk_level,
            "health_score": c.health_score,
            "predicted_ltv": c.predicted_ltv,
            "reasons": reasons,
        })

    return result

@router.get("/ltv-analysis")
async def get_ltv_analysis(db: Session = Depends(get_session)):
    contacts = db.exec(
        select(Contact).where(Contact.tenant_id == TENANT_ID)
    ).all()

    if not contacts:
        return {
            "avg_ltv_per_segment": {},
            "top_performing_channels": [],
            "total_contacts": 0,
        }

    # Segment contacts by churn_risk_level and calculate avg LTV
    segments: dict[str, list[float]] = {}
    for c in contacts:
        level = c.churn_risk_level or "unknown"
        if c.predicted_ltv is not None:
            segments.setdefault(level, []).append(c.predicted_ltv)

    avg_ltv_per_segment = {
        seg: round(sum(vals) / len(vals), 2)
        for seg, vals in segments.items()
        if vals
    }

    # Overall stats
    all_ltvs = [c.predicted_ltv for c in contacts if c.predicted_ltv is not None]
    overall_avg = round(sum(all_ltvs) / max(len(all_ltvs), 1), 2)

    return {
        "avg_ltv_per_segment": avg_ltv_per_segment,
        "overall_avg_ltv": overall_avg,
        "total_contacts": len(contacts),
        "top_performing_channels": []  # Would need channel data correlation
    }

@router.post("/recalculate")
async def trigger_recalculation():
    return {
        "status": "recalculation_triggered",
        "triggered_at": datetime.utcnow().isoformat(),
        "eta": "10 minutes"
    }
