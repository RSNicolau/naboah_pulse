from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import MediaAsset, ContentAsset, PromptArtifact, PersonaProfile, KnowledgePack, AvatarProfile, VoiceProfile, AvatarScene
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
from datetime import datetime

router = APIRouter(prefix="/creative", tags=["creative"])

TENANT_ID = "naboah"

class PromptGenRequest(BaseModel):
    persona_id: str
    knowledge_id: str
    job_type: str
    user_input: str

@router.post("/generate-prompt")
async def generate_prompt(req: PromptGenRequest, db: Session = Depends(get_session)):
    persona = db.get(PersonaProfile, req.persona_id)
    knowledge = db.get(KnowledgePack, req.knowledge_id)
    
    if not persona: raise HTTPException(status_code=404, detail="Persona not found")

    # Jarvis Multi-stage Prompt Synthesis (Mock)
    system_directive = f"Act as {persona.name}. Tone: {persona.tone_json.get('primary', 'Professional')}"
    knowledge_context = f"Use context from: {knowledge.name if knowledge else 'General Knowledge'}"
    
    synthesized_prompt = f"[STYLIZED] {system_directive}. {knowledge_context}. Input: {req.user_input}. Output specialized for {req.job_type}."
    
    # Map job_type to prompt_type
    prompt_type_map = {
        "image": "text_to_image",
        "video": "text_to_video",
        "text": "text_generation",
        "audio": "text_to_audio",
        "copy": "text_generation",
    }
    prompt_type = prompt_type_map.get(req.job_type, req.job_type)

    artifact = PromptArtifact(
        id=f"prm_{uuid.uuid4().hex[:6]}",
        tenant_id=TENANT_ID,
        prompt_type=prompt_type,
        model_provider="Midjourney",
        model_name="v6.1",
        prompt_text=synthesized_prompt,
        qa_status="pending",
        risk_score=0.05
    )
    db.add(artifact)
    db.commit()
    db.refresh(artifact)
    return artifact

@router.get("/assets")
async def list_assets(asset_type: Optional[str] = None, db: Session = Depends(get_session)):
    statement = select(MediaAsset)
    if asset_type:
        statement = statement.where(MediaAsset.asset_type == asset_type)
    return db.exec(statement.order_by(MediaAsset.created_at.desc())).all()

@router.post("/assets/{asset_id}/qa")
async def run_asset_qa(asset_id: str, db: Session = Depends(get_session)):
    asset = db.get(MediaAsset, asset_id)
    if not asset: raise HTTPException(status_code=404, detail="Asset not found")
    
    # Mock AI Brand Safety Check
    asset.qa_status = "approved"
    asset.risk_score = 0.01
    db.add(asset)
    db.commit()
    return {"status": "success", "asset_id": asset_id, "qa_result": "approved"}

# --- IMAGE LAB & MEME SPRINT ---

@router.post("/image-lab/product-to-scene")
async def generate_product_scene(
    product_image_url: str,
    preset: str, # studio, lifestyle, outdoor, cyberpunk
    db: Session = Depends(get_session)
):
    asset_id = f"ast_{uuid.uuid4().hex[:6]}"
    # Mock generation process
    new_asset = MediaAsset(
        id=asset_id,
        tenant_id=TENANT_ID,
        asset_type="image",
        title=f"Product Scene: {preset.capitalize()}",
        storage_url=f"https://cdn.pulse.ai/generated/{asset_id}.png",
        provenance_json={"model": "Pulse Vision v2", "preset": preset},
        qa_status="approved"
    )
    db.add(new_asset)
    db.commit()
    return new_asset

@router.get("/trends/viral")
async def get_viral_trends(db: Session = Depends(get_session)):
    # Query recent ContentAssets and MediaAssets to derive trend-like data
    content_assets = db.exec(
        select(ContentAsset)
        .where(ContentAsset.tenant_id == TENANT_ID)
        .order_by(ContentAsset.created_at.desc())
        .limit(20)
    ).all()

    media_assets = db.exec(
        select(MediaAsset)
        .where(MediaAsset.tenant_id == TENANT_ID)
        .order_by(MediaAsset.created_at.desc())
        .limit(20)
    ).all()

    trends = []
    for asset in content_assets:
        trends.append({
            "id": asset.id,
            "name": asset.title,
            "source": "content_asset",
            "type": asset.type,
            "qa_status": asset.qa_status,
        })
    for asset in media_assets:
        trends.append({
            "id": asset.id,
            "name": asset.title,
            "source": "media_asset",
            "type": asset.asset_type,
            "qa_status": asset.qa_status,
        })

    return trends

@router.post("/meme/generate")
async def generate_meme(trend_id: str, db: Session = Depends(get_session)):
    asset_id = f"meme_{uuid.uuid4().hex[:6]}"
    new_asset = MediaAsset(
        id=asset_id,
        tenant_id=TENANT_ID,
        asset_type="image",
        title=f"Meme for Trend {trend_id}",
        storage_url=f"https://cdn.pulse.ai/memes/{asset_id}.jpg",
        provenance_json={"type": "Meme Gen", "trend_id": trend_id},
        qa_status="approved"
    )
    db.add(new_asset)
    db.commit()
    return new_asset
