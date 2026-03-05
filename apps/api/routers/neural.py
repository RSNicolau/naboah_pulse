from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select
from db import get_session
from models import KnowledgeSource, KnowledgeChunk
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter(prefix="/neural/knowledge", tags=["neural"])

TENANT_ID = "naboah"

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

@router.get("/sources", response_model=List[KnowledgeSource])
async def list_sources(db: Session = Depends(get_session)):
    sources = db.exec(
        select(KnowledgeSource).where(KnowledgeSource.tenant_id == TENANT_ID)
    ).all()
    return sources

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_session)):
    # Create a KnowledgeSource record in DB
    source_id = f"ks_{uuid.uuid4().hex[:6]}"
    source = KnowledgeSource(
        id=source_id,
        tenant_id=TENANT_ID,
        name=file.filename or "Unnamed Document",
        source_type="file",
        metadata_json={"content_type": file.content_type, "size": file.size},
        status="indexing",
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    return {
        "id": source.id,
        "name": source.name,
        "status": source.status,
        "message": "O Jarvis começou a ler este documento."
    }

@router.post("/ask")
async def ask_neural_engine(request: SearchRequest, db: Session = Depends(get_session)):
    # Mock RAG - but use real chunks from DB for citations
    chunks = db.exec(select(KnowledgeChunk).limit(request.top_k)).all()

    citations = []
    context_snippets = []
    for chunk in chunks:
        citations.append({
            "source_id": chunk.source_id,
            "text": chunk.content[:200] if chunk.content else "",
            "metadata": chunk.metadata_json,
        })
        context_snippets.append(chunk.content[:100] if chunk.content else "")

    # Build a mock answer that references the real data
    if context_snippets:
        answer = f"Com base nos documentos indexados, encontrei: {context_snippets[0]}..."
    else:
        answer = "Nenhum documento indexado encontrado. Faça upload de documentos para habilitar o Neural Search."

    return {
        "answer": answer,
        "citations": citations,
        "confidence": 0.85 if chunks else 0.0,
        "chunks_searched": len(chunks),
    }

@router.get("/health")
async def get_knowledge_health(db: Session = Depends(get_session)):
    # Aggregate from KnowledgeSource + KnowledgeChunk
    sources = db.exec(select(KnowledgeSource).where(KnowledgeSource.tenant_id == TENANT_ID)).all()
    total_sources = len(sources)
    active_sources = sum(1 for s in sources if s.status == "active")
    error_sources = [s.name for s in sources if s.status == "error"]

    # Count all chunks across all sources for this tenant
    total_chunks = 0
    for source in sources:
        chunks = db.exec(select(KnowledgeChunk).where(KnowledgeChunk.source_id == source.id)).all()
        total_chunks += len(chunks)

    # Health score: percentage of active sources
    health_score = round(active_sources / max(total_sources, 1) * 100)

    gaps = []
    if error_sources:
        gaps.extend([f"Fonte com erro: {name}" for name in error_sources])
    pending_sources = [s.name for s in sources if s.status == "pending"]
    if pending_sources:
        gaps.extend([f"Aguardando indexacao: {name}" for name in pending_sources])

    return {
        "total_sources": total_sources,
        "active_sources": active_sources,
        "indexed_chunks": total_chunks,
        "health_score": health_score,
        "gaps": gaps if gaps else ["Nenhum problema detectado"],
    }
