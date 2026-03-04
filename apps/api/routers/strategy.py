from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import PersonaProfile, KnowledgePack, BrandStylePack
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid

router = APIRouter(prefix="/strategy", tags=["strategy"])

class PersonaCreate(BaseModel):
    name: str
    tone: Dict
    do_dont: Dict

@router.post("/personas")
async def create_persona(data: PersonaCreate, db: Session = Depends(get_session)):
    persona = PersonaProfile(
        id=f"per_{uuid.uuid4().hex[:6]}",
        tenant_id="t1",
        name=data.name,
        tone_json=data.tone,
        do_dont_json=data.do_dont
    )
    db.add(persona)
    db.commit()
    db.refresh(persona)
    return persona

@router.get("/context/resolve")
async def resolve_context(persona_id: str, knowledge_id: str, db: Session = Depends(get_session)):
    persona = db.get(PersonaProfile, persona_id)
    knowledge = db.get(KnowledgePack, knowledge_id)
    
    if not persona or not knowledge:
        raise HTTPException(status_code=404, detail="Persona or Knowledge pack not found")
        
    return {
        "persona_name": persona.name,
        "tone": persona.tone_json,
        "knowledge_sources": knowledge.sources_json,
        "final_prompt_directive": f"Atuar como {persona.name} com base nos manuais {knowledge.name}."
    }

@router.get("/personas")
async def list_personas(db: Session = Depends(get_session)):
    return db.exec(select(PersonaProfile)).all()

@router.get("/knowledge")
async def list_knowledge(db: Session = Depends(get_session)):
    return db.exec(select(KnowledgePack)).all()
