from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import ForumTopic, FeatureRequest
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/community", tags=["community"])

TENANT_ID = "naboah"

class TopicCreate(BaseModel):
    title: str
    content: str
    category: str

class FeedbackCreate(BaseModel):
    title: str
    description: str

@router.get("/topics", response_model=List[ForumTopic])
async def list_topics(db: Session = Depends(get_session)):
    topics = db.exec(select(ForumTopic).order_by(ForumTopic.created_at.desc())).all()
    if not topics:
        return [
            ForumTopic(id="t1", tenant_id=TENANT_ID, author_id="u1", title="Bem-vindos à Comunidade Pulse!", content="Este é o nosso espaço de troca.", category="Announcements", is_pinned=True),
            ForumTopic(id="t2", tenant_id=TENANT_ID, author_id="u2", title="Dúvida sobre integração Webhook", content="Alguém já usou a API de Voice?", category="Q&A"),
        ]
    return topics

@router.post("/topics")
async def create_topic(data: TopicCreate, db: Session = Depends(get_session)):
    new_topic = ForumTopic(
        id=f"topic_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID, # Mock
        author_id="user_admin", # Mock
        title=data.title,
        content=data.content,
        category=data.category
    )
    db.add(new_topic)
    db.commit()
    return new_topic

@router.get("/feedback", response_model=List[FeatureRequest])
async def list_feedback(db: Session = Depends(get_session)):
    requests = db.exec(select(FeatureRequest).order_by(FeatureRequest.votes.desc())).all()
    if not requests:
        return [
            FeatureRequest(id="fr1", tenant_id=TENANT_ID, author_id="u1", title="Modo Escuro ainda mais escuro", description="Sugestão estética.", votes=45, status="planned"),
            FeatureRequest(id="fr2", tenant_id=TENANT_ID, author_id="u2", title="App Nativo iOS", description="Precisamos de push notifications nativas.", votes=128, status="under_review"),
        ]
    return requests

@router.post("/feedback/{request_id}/vote")
async def vote_feedback(request_id: str, db: Session = Depends(get_session)):
    # Simulação de voto
    return {"status": "voted", "new_count": 129}
