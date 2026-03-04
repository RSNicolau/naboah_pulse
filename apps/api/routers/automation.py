from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import AutomationTrigger, PublicationSchedule
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/automation", tags=["automation"])

TENANT_ID = "naboah"

DEFAULT_TRIGGERS = [
    {
        "id": "trg_welcome_wa",
        "name": "Auto-reply WhatsApp Boas-vindas",
        "trigger_type": "message_received",
        "action_type": "send_whatsapp",
        "is_active": True,
        "config_json": {"channel": "whatsapp", "keyword": "oi,olá,boa tarde,bom dia"},
        "action_params_json": {"message": "Olá! Recebemos a sua mensagem. Um agente irá responder em breve 🚀"},
        "last_run_at_offset_minutes": 5,
    },
    {
        "id": "trg_ticket_urgent",
        "name": "Alerta Ticket Urgente → Equipa",
        "trigger_type": "ticket_created",
        "action_type": "notify_team",
        "is_active": True,
        "config_json": {"priority": "urgent"},
        "action_params_json": {"channel": "#suporte-urgente"},
        "last_run_at_offset_minutes": 47,
    },
    {
        "id": "trg_deal_close",
        "name": "Deal Fechado → Update CRM",
        "trigger_type": "deal_updated",
        "action_type": "update_deal",
        "is_active": True,
        "config_json": {"stage": "stg_4"},
        "action_params_json": {"status": "won", "tag": "cliente-ativo"},
        "last_run_at_offset_minutes": 120,
    },
    {
        "id": "trg_churn_ai",
        "name": "Detecção de Churn (Jarvis IA)",
        "trigger_type": "conversation_closed",
        "action_type": "ai_analyze",
        "is_active": False,
        "config_json": {"sentiment_threshold": "-0.5"},
        "action_params_json": {"action": "flag_churn_risk"},
        "last_run_at_offset_minutes": None,
    },
    {
        "id": "trg_daily_report",
        "name": "Relatório Diário de KPIs (9h)",
        "trigger_type": "cron",
        "action_type": "notify_team",
        "is_active": True,
        "config_json": {"schedule": "daily_9am"},
        "action_params_json": {"report_type": "daily_kpi", "channel": "#reports"},
        "last_run_at_offset_minutes": 60 * 15,
    },
]


def condition_label(trigger_type: str, config: dict) -> str:
    """Human-readable summary of trigger conditions."""
    if trigger_type == "message_received":
        parts = []
        if config.get("channel"):
            parts.append(f"Canal: {config['channel']}")
        if config.get("keyword"):
            kw = config["keyword"]
            parts.append(f'Palavras: "{kw[:30]}"')
        return " · ".join(parts) if parts else "Qualquer mensagem"
    if trigger_type == "ticket_created":
        p = config.get("priority")
        return f"Prioridade: {p}" if p else "Qualquer ticket"
    if trigger_type == "deal_updated":
        s = config.get("stage")
        stage_names = {"stg_1": "Lead", "stg_2": "Apresentação", "stg_3": "Negociação", "stg_4": "Fechamento"}
        return f"Etapa: {stage_names.get(s, s)}" if s else "Qualquer deal"
    if trigger_type == "cron":
        schedule_labels = {
            "daily_9am": "Todos os dias às 9h",
            "hourly":    "A cada hora",
            "weekly_mon": "Segundas-feiras",
        }
        s = config.get("schedule", "")
        return schedule_labels.get(s, s or "Agendado")
    if trigger_type == "conversation_closed":
        t = config.get("sentiment_threshold")
        return f"Sentiment < {t}" if t else "Qualquer conversa encerrada"
    if trigger_type == "webhook":
        return config.get("endpoint", "Webhook externo")
    return ""


def ensure_triggers(db: Session) -> List[AutomationTrigger]:
    existing = db.exec(
        select(AutomationTrigger).where(AutomationTrigger.tenant_id == TENANT_ID)
    ).all()
    if existing:
        return existing

    now = datetime.utcnow()
    created = []
    for t in DEFAULT_TRIGGERS:
        last_run = (now - timedelta(minutes=t["last_run_at_offset_minutes"])) if t.get("last_run_at_offset_minutes") else None
        trigger = AutomationTrigger(
            id=t["id"],
            tenant_id=TENANT_ID,
            name=t["name"],
            trigger_type=t["trigger_type"],
            action_type=t["action_type"],
            is_active=t["is_active"],
            config_json=t["config_json"],
            action_params_json=t["action_params_json"],
            last_run_at=last_run,
        )
        db.add(trigger)
        created.append(trigger)
    try:
        db.commit()
        return db.exec(
            select(AutomationTrigger).where(AutomationTrigger.tenant_id == TENANT_ID)
        ).all()
    except Exception:
        db.rollback()
        return created


def enrich(trigger: AutomationTrigger) -> dict:
    return {
        "id": trigger.id,
        "name": trigger.name,
        "trigger_type": trigger.trigger_type,
        "action_type": trigger.action_type,
        "is_active": trigger.is_active,
        "config_json": trigger.config_json,
        "action_params_json": trigger.action_params_json,
        "condition_label": condition_label(trigger.trigger_type, trigger.config_json or {}),
        "last_run_at": trigger.last_run_at.isoformat() if trigger.last_run_at else None,
        "created_at": trigger.created_at.isoformat() if trigger.created_at else None,
    }


class TriggerCreate(BaseModel):
    name: str
    trigger_type: str
    action_type: str
    config_json: Optional[Dict[str, Any]] = {}
    action_params_json: Optional[Dict[str, Any]] = {}


@router.post("/triggers")
async def create_trigger(req: TriggerCreate, db: Session = Depends(get_session)):
    ensure_triggers(db)
    trigger = AutomationTrigger(
        id=f"trg_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        name=req.name,
        trigger_type=req.trigger_type,
        action_type=req.action_type,
        config_json=req.config_json or {},
        action_params_json=req.action_params_json or {},
    )
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    return enrich(trigger)


@router.get("/triggers")
async def list_triggers(db: Session = Depends(get_session)):
    triggers = ensure_triggers(db)
    return [enrich(t) for t in sorted(triggers, key=lambda x: x.created_at or datetime.min, reverse=True)]


@router.delete("/triggers/{trigger_id}")
async def delete_trigger(trigger_id: str, db: Session = Depends(get_session)):
    trigger = db.get(AutomationTrigger, trigger_id)
    if not trigger or trigger.tenant_id != TENANT_ID:
        raise HTTPException(status_code=404, detail="Trigger not found")
    db.delete(trigger)
    db.commit()
    return {"ok": True}


@router.patch("/triggers/{trigger_id}/toggle")
async def toggle_trigger(trigger_id: str, db: Session = Depends(get_session)):
    trigger = db.get(AutomationTrigger, trigger_id)
    if not trigger or trigger.tenant_id != TENANT_ID:
        raise HTTPException(status_code=404, detail="Trigger not found")
    trigger.is_active = not trigger.is_active
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    return enrich(trigger)


@router.post("/triggers/{trigger_id}/run")
async def simulate_trigger(trigger_id: str, db: Session = Depends(get_session)):
    """Simulate a manual trigger run — updates last_run_at."""
    trigger = db.get(AutomationTrigger, trigger_id)
    if not trigger or trigger.tenant_id != TENANT_ID:
        raise HTTPException(status_code=404, detail="Trigger not found")
    trigger.last_run_at = datetime.utcnow()
    db.add(trigger)
    db.commit()
    db.refresh(trigger)
    return {"ok": True, "last_run_at": trigger.last_run_at.isoformat()}


@router.get("/schedule")
async def get_schedule(db: Session = Depends(get_session)):
    return db.exec(select(PublicationSchedule).order_by(PublicationSchedule.scheduled_for)).all()
