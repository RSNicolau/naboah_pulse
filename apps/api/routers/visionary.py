from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from db import get_session
from models import UIState
from pydantic import BaseModel
from typing import List, Optional, Any
import uuid
from datetime import datetime

router = APIRouter(prefix="/visionary", tags=["visionary"])

TENANT_ID = "naboah"

class UICommandRequest(BaseModel):
    prompt: str
    current_context: dict

@router.post("/generate-component")
async def generate_ui_component(request: UICommandRequest, db: Session = Depends(get_session)):
    # Save the generated component to UIState
    state_id = f"gen_{uuid.uuid4().hex[:6]}"
    context_key = request.current_context.get("context_key", "generated")

    component_data = {
        "component_type": "dynamic_widget",
        "title": f"Componente gerado via prompt: {request.prompt[:50]}",
        "props": request.current_context,
        "prompt": request.prompt,
    }

    ui_state = UIState(
        id=state_id,
        tenant_id=TENANT_ID,
        user_id=request.current_context.get("user_id", "system"),
        context_key=context_key,
        layout_json=component_data,
        widgets_json=[component_data],
    )
    db.add(ui_state)
    db.commit()
    db.refresh(ui_state)

    return {
        "component_type": "dynamic_widget",
        "title": component_data["title"],
        "props": request.current_context,
        "id": state_id,
    }

@router.get("/state/{context_key}")
async def get_ui_state(context_key: str, db: Session = Depends(get_session)):
    # Query UIState from DB
    state = db.exec(
        select(UIState).where(
            UIState.tenant_id == TENANT_ID,
            UIState.context_key == context_key,
        )
    ).first()

    if not state:
        return None

    return state

@router.post("/state")
async def save_ui_state(state: dict, db: Session = Depends(get_session)):
    context_key = state.get("context_key", "default")
    user_id = state.get("user_id", "system")

    # Check if state already exists for this context_key
    existing = db.exec(
        select(UIState).where(
            UIState.tenant_id == TENANT_ID,
            UIState.context_key == context_key,
        )
    ).first()

    if existing:
        existing.layout_json = state.get("layout_json", existing.layout_json)
        existing.widgets_json = state.get("widgets_json", existing.widgets_json)
        existing.theme_overrides_json = state.get("theme_overrides_json", existing.theme_overrides_json)
        existing.updated_at = datetime.utcnow()
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return {"status": "updated", "id": existing.id}
    else:
        new_state = UIState(
            id=f"ui_{uuid.uuid4().hex[:6]}",
            tenant_id=TENANT_ID,
            user_id=user_id,
            context_key=context_key,
            layout_json=state.get("layout_json", {}),
            widgets_json=state.get("widgets_json", []),
            theme_overrides_json=state.get("theme_overrides_json", {}),
        )
        db.add(new_state)
        db.commit()
        db.refresh(new_state)
        return {"status": "created", "id": new_state.id}
