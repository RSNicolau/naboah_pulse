from fastapi import APIRouter, Depends, Response
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select
from db import get_session
from models import Message, ContentAsset, Agent
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
        writer.writerow([m.id, "Mensagem", m.created_at, m.body[:50], "Enviado"])
        
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
    return {
        "total_impact": 125400,
        "conversion_rate": "3.2%",
        "active_campaigns": 12,
        "ai_savings_hours": 450,
        "trends": [
            {"date": "2026-02-25", "value": 400},
            {"date": "2026-02-26", "value": 600},
            {"date": "2026-02-27", "value": 800},
            {"date": "2026-02-28", "value": 700},
            {"date": "2026-03-01", "value": 900},
            {"date": "2026-03-02", "value": 1100},
            {"date": "2026-03-03", "value": 1300},
        ]
    }
