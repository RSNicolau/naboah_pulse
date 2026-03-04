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
    # Mock de análise de visão (Gemini/GPT-4o Vision)
    if data.media_type == "image":
        return {
            "status": "success",
            "labels": ["comprovante", "pagamento", "itau"],
            "ocr_text": "VALOR: R$ 150,00 - DATA: 03/03/2026",
            "visual_summary": "Um comprovante de transação bancária legível."
        }
    elif data.media_type == "video":
        return {
            "status": "success",
            "summary": "O cliente mostra um unboxing do produto, indicando que a caixa chegou levemente amassada no canto superior esquerdo.",
            "events": [
                {"timestamp": "0:05", "event": "Abertura da embalagem"},
                {"timestamp": "0:45", "event": "Demonstração do dano funcional"}
            ]
        }
    return {"status": "unsupported_media"}

@router.get("/insights/message/{message_id}")
async def get_message_visual_insights(message_id: str, db: Session = Depends(get_session)):
    # Simulação de busca de insights já processados
    return {
        "message_id": message_id,
        "has_visual_data": True,
        "labels": ["laptop", "apple", "office"],
        "ocr_available": False
    }
