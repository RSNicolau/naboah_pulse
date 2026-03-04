from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Ticket, KBArticle
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timedelta

router = APIRouter(prefix="/support", tags=["support"])

TENANT_ID = "naboah"


def ensure_tickets(db: Session) -> List[Ticket]:
    tickets = db.exec(select(Ticket).where(Ticket.tenant_id == TENANT_ID)).all()
    return tickets


class TicketCreate(BaseModel):
    subject: str
    description: str
    priority: Optional[str] = "medium"


class TicketStatusUpdate(BaseModel):
    status: str


@router.post("/tickets", response_model=Ticket)
async def create_ticket(data: TicketCreate, db: Session = Depends(get_session)):
    sla_hours = {"urgent": 2, "high": 4, "medium": 24, "low": 72}
    new_ticket = Ticket(
        id=f"tick_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        subject=data.subject,
        description=data.description,
        priority=data.priority,
        status="new",
        due_at=datetime.utcnow() + timedelta(hours=sla_hours.get(data.priority or "medium", 24)),
    )
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)
    return new_ticket


@router.get("/tickets")
async def list_tickets(db: Session = Depends(get_session)):
    tickets = db.exec(
        select(Ticket)
        .where(Ticket.tenant_id == TENANT_ID)
        .order_by(Ticket.created_at.desc())
    ).all()
    return tickets


@router.post("/tickets/{ticket_id}/resolve")
async def resolve_ticket(ticket_id: str, db: Session = Depends(get_session)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    ticket.status = "solved"
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.commit()
    return {"status": "resolved", "ticket_id": ticket_id}


@router.patch("/tickets/{ticket_id}/status")
async def update_ticket_status(ticket_id: str, data: TicketStatusUpdate, db: Session = Depends(get_session)):
    ticket = db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    valid = {"new", "open", "pending", "solved", "closed"}
    if data.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid}")
    ticket.status = data.status
    ticket.updated_at = datetime.utcnow()
    db.add(ticket)
    db.commit()
    return {"status": data.status, "ticket_id": ticket_id}


@router.get("/kb")
async def list_kb_articles(db: Session = Depends(get_session)):
    articles = db.exec(select(KBArticle).where(KBArticle.is_published == True)).all()
    return articles
