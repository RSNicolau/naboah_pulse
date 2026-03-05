from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import Message, ContentAsset
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/perception", tags=["perception"])

class MediaAnalysisRequest(BaseModel):
    media_url: str
    media_type: str # image, video, document

@router.post("/analyze")
async def analyze_media(data: MediaAnalysisRequest):
    # NOTE: This endpoint returns placeholder results. In production, it will
    # call an AI vision service (Gemini / GPT-4o Vision) to perform real analysis.
    # The response structure matches the expected contract for downstream consumers.
    if data.media_type == "image":
        return {
            "status": "placeholder",
            "media_url": data.media_url,
            "media_type": data.media_type,
            "labels": [],
            "ocr_text": None,
            "visual_summary": "AI vision analysis not yet connected. Placeholder response.",
        }
    elif data.media_type == "video":
        return {
            "status": "placeholder",
            "media_url": data.media_url,
            "media_type": data.media_type,
            "summary": "AI vision analysis not yet connected. Placeholder response.",
            "events": [],
        }
    return {
        "status": "placeholder",
        "media_url": data.media_url,
        "media_type": data.media_type,
        "message": f"Media type '{data.media_type}' accepted. AI analysis not yet connected.",
    }

@router.get("/insights/message/{message_id}")
async def get_message_visual_insights(message_id: str, db: Session = Depends(get_session)):
    message = db.get(Message, message_id)
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    has_visual = bool(message.visual_summary_json)
    labels = message.visual_summary_json.get("labels", []) if message.visual_summary_json else []
    ocr_available = bool(message.ocr_text)

    return {
        "message_id": message_id,
        "has_visual_data": has_visual,
        "labels": labels,
        "ocr_available": ocr_available,
        "ocr_text": message.ocr_text,
        "visual_summary": message.visual_summary_json,
    }
