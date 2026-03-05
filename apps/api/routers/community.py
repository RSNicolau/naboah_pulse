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
    topics = db.exec(
        select(ForumTopic)
        .where(ForumTopic.tenant_id == TENANT_ID)
        .order_by(ForumTopic.created_at.desc())
    ).all()
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
    requests = db.exec(
        select(FeatureRequest)
        .where(FeatureRequest.tenant_id == TENANT_ID)
        .order_by(FeatureRequest.votes.desc())
    ).all()
    return requests

@router.post("/feedback/{request_id}/vote")
async def vote_feedback(request_id: str, db: Session = Depends(get_session)):
    feature_request = db.exec(
        select(FeatureRequest).where(FeatureRequest.id == request_id)
    ).first()
    if not feature_request:
        raise HTTPException(status_code=404, detail="Feature request not found")

    feature_request.votes = (feature_request.votes or 0) + 1
    db.add(feature_request)
    db.commit()
    db.refresh(feature_request)
    return {"status": "voted", "new_count": feature_request.votes}
