from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from db import get_session
from models import IntakeItem, CreativeJob
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/intake", tags=["intake"])

TENANT_ID = "naboah"

@router.post("/upload")
async def upload_intake(
    source: str,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = None,
    db: Session = Depends(get_session)
):
    item_id = f"itk_{uuid.uuid4().hex[:6]}"
    file_type = "text"
    file_url = None
    
    if file:
        file_type = file.content_type.split("/")[0] if file.content_type else "unknown"
        if "pdf" in file.content_type: file_type = "pdf"
        if "sheet" in file.content_type: file_type = "xlsx"
        file_url = f"https://cdn.pulse.ai/uploads/{item_id}_{file.filename}"

    # Simulação de Classificação de Intenção via Jarvis
    intent = "content"
    if text and ("anúncio" in text.lower() or "ads" in text.lower()):
        intent = "ads"
    elif file_type in ["image", "video"]:
        intent = "creative"

    item = IntakeItem(
        id=item_id,
        tenant_id=TENANT_ID,
        source_type=source,
        file_type=file_type,
        file_url=file_url,
        text_content=text,
        intent=intent,
        status="pending"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/")
async def list_intake(db: Session = Depends(get_session)):
    items = db.exec(select(IntakeItem).order_by(IntakeItem.created_at.desc())).all()
    return items

@router.post("/{intake_id}/create-job")
async def create_job_from_intake(
    intake_id: str,
    job_type: str,
    persona_id: str,
    knowledge_id: str,
    db: Session = Depends(get_session)
):
    job = CreativeJob(
        id=f"job_{uuid.uuid4().hex[:6]}",
        tenant_id=TENANT_ID,
        intake_item_id=intake_id,
        job_type=job_type,
        persona_profile_id=persona_id,
        knowledge_pack_id=knowledge_id,
        status="draft"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
