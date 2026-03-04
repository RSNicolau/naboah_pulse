from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import ContentAsset
from pydantic import BaseModel
from typing import Optional
import uuid
import os
from datetime import datetime
import anthropic

router = APIRouter(prefix="/content", tags=["content"])

TENANT_ID = "naboah"

PLATFORM_LABELS: dict[str, str] = {
    "instagram_reel": "Instagram Reel",
    "linkedin_post":  "LinkedIn Post",
    "email_campaign": "Email Campaign",
    "facebook_ad":    "Facebook Ad",
}

PLATFORM_MAP: dict[str, str] = {
    "instagram reel": "instagram_reel",
    "linkedin post":  "linkedin_post",
    "email campaign": "email_campaign",
    "facebook ad":    "facebook_ad",
}

TONE_MAP: dict[str, str] = {
    "witty/funny": "witty",
    "witty_funny":  "witty",
}

RISK_BY_TONE: dict[str, float] = {
    "urgent":       0.28,
    "witty":        0.13,
    "witty/funny":  0.13,
    "educational":  0.05,
    "professional": 0.07,
}

RISK_ALERTS: dict[str, str] = {
    "urgent":       "Alto impacto emocional — verifique conformidade com regulamentações de publicidade e evite promessas não verificáveis.",
    "professional": "Baixo risco. Certifique-se de que as métricas citadas têm suporte em dados reais.",
    "witty":        "Tom informal aprovado. Revise se o humor é culturalmente neutro para todos os segmentos.",
    "educational":  "Excelente para awareness. Adicione fontes para as estatísticas citadas para aumentar credibilidade.",
}


class GenerateRequest(BaseModel):
    prompt: str
    platform: str = "instagram_reel"
    tone: str = "professional"


class ContentAssetCreate(BaseModel):
    title: str
    body: str
    platform: Optional[str] = None
    tone: Optional[str] = None
    qa_status: Optional[str] = "pending"
    risk_score: Optional[float] = 0.0


@router.post("/generate")
async def generate_content(req: GenerateRequest):
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY não configurada")

    platform = PLATFORM_MAP.get(req.platform.lower(), req.platform.lower().replace(" ", "_"))
    tone_key = TONE_MAP.get(req.tone.lower(), req.tone.lower())
    platform_label = PLATFORM_LABELS.get(platform, req.platform)
    risk = RISK_BY_TONE.get(tone_key, 0.10)
    risk_msg = RISK_ALERTS.get(tone_key, RISK_ALERTS["professional"])

    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=(
            "Você é Jarvis, o assistente de IA da plataforma Naboah Pulse — um hub omnichannel com IA "
            "para equipas de suporte e vendas. Crie conteúdos de marketing profissionais e persuasivos "
            "em português (pt-BR). Responda APENAS com o conteúdo formatado, sem introduções ou comentários."
        ),
        messages=[{
            "role": "user",
            "content": (
                f"Crie um(a) {platform_label} com tom '{tone_key}' sobre: {req.prompt.strip()}\n\n"
                "Estruture assim:\n"
                "[Hook]\n<frase de abertura impactante>\n\n"
                "[Value Prop]\n<proposta de valor clara>\n\n"
                "[CTA]\n<chamada para ação>"
            ),
        }],
    )
    body = message.content[0].text

    return {
        "title": f"{platform_label} — {tone_key}",
        "body": body,
        "platform": platform,
        "tone": tone_key,
        "qa_status": "pending",
        "risk_score": risk,
        "risk_alert": risk_msg,
        "brand_voice_ok": risk < 0.20,
    }


@router.post("/assets")
async def save_content_asset(data: ContentAssetCreate, db: Session = Depends(get_session)):
    asset = ContentAsset(
        id=f"asset_{uuid.uuid4().hex[:8]}",
        tenant_id=TENANT_ID,
        type=data.platform or "post",
        title=data.title,
        body=data.body,
        metadata_json={"platform": data.platform, "tone": data.tone},
        qa_status=data.qa_status or "pending",
        risk_score=data.risk_score or 0.0,
        created_at=datetime.utcnow(),
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.get("/assets")
async def list_content_assets(db: Session = Depends(get_session)):
    assets = db.exec(
        select(ContentAsset)
        .where(ContentAsset.tenant_id == TENANT_ID)
        .order_by(ContentAsset.created_at.desc())
    ).all()
    return assets


@router.post("/assets/{asset_id}/approve")
async def approve_content_asset(asset_id: str, db: Session = Depends(get_session)):
    asset = db.get(ContentAsset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset não encontrado")
    asset.qa_status = "approved"
    db.add(asset)
    db.commit()
    return {"status": "approved", "id": asset_id}


@router.delete("/assets/{asset_id}")
async def delete_content_asset(asset_id: str, db: Session = Depends(get_session)):
    asset = db.get(ContentAsset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset não encontrado")
    db.delete(asset)
    db.commit()
    return {"status": "deleted", "id": asset_id}
