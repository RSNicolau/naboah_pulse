from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from db import get_session
from models import Message, ContentAsset, Agent, Campaign, Deal
import csv
import io
import json
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/export/csv")
async def export_csv(db: Session = Depends(get_session)):
    # Simulação de exportação de dados agregados
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Tipo", "Data", "Título/Conteúdo", "Status"])
    
    # Pegar alguns dados de exemplo
    messages = db.exec(select(Message).limit(10)).all()
    for m in messages:
        writer.writerow([m.id, "Mensagem", m.created_at, m.content[:50] if m.content else "", "Enviado"])
        
    assets = db.exec(select(ContentAsset).limit(10)).all()
    for a in assets:
        writer.writerow([a.id, "Conteúdo", a.created_at, a.title, a.status])
        
    output.seek(0)
    filename = f"pulse_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/stats/summary")
async def get_stats_summary(db: Session = Depends(get_session)):
    from datetime import timedelta
    from datetime import date as date_type

    TENANT_ID = "naboah"

    total_messages = len(db.exec(select(Message).where(Message.tenant_id == TENANT_ID)).all())
    total_assets = len(db.exec(select(ContentAsset).where(ContentAsset.tenant_id == TENANT_ID)).all())
    total_agents = len(db.exec(select(Agent).where(Agent.tenant_id == TENANT_ID)).all())

    # Active campaigns
    active_campaigns = len(db.exec(
        select(Campaign).where(Campaign.tenant_id == TENANT_ID, Campaign.status == "active")
    ).all())

    # Conversion rate from deals
    all_deals = db.exec(select(Deal).where(Deal.tenant_id == TENANT_ID)).all()
    won = sum(1 for d in all_deals if d.status == "won")
    conv_rate = round(won / max(len(all_deals), 1) * 100, 1)

    # Daily message trends for last 7 days
    today = date_type.today()
    all_msgs = db.exec(select(Message).where(Message.tenant_id == TENANT_ID)).all()
    daily: dict[str, int] = {}
    cutoff = today - timedelta(days=6)
    for msg in all_msgs:
        if msg.created_at:
            d = msg.created_at.date()
            if d >= cutoff:
                daily[str(d)] = daily.get(str(d), 0) + 1

    trends = [
        {"date": str(today - timedelta(days=i)), "value": daily.get(str(today - timedelta(days=i)), 0)}
        for i in range(6, -1, -1)
    ]

    return {
        "total_impact": total_messages + total_assets,
        "conversion_rate": f"{conv_rate}%",
        "active_campaigns": active_campaigns,
        "ai_savings_hours": total_agents * 24,  # Estimate based on active agents
        "total_messages": total_messages,
        "total_assets": total_assets,
        "total_agents": total_agents,
        "trends": trends,
    }
