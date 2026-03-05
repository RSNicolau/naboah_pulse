from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select
from db import get_session
from models import SynergyRoom, CanvasElement, StickyNote
from pydantic import BaseModel
from typing import List, Optional, Dict
import uuid
import json
from datetime import datetime

router = APIRouter(prefix="/synergy", tags=["synergy"])

# Gerenciador de conexões simplificado para Multiplayer Presence
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)

    async def broadcast(self, room_id: str, message: dict):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

TENANT_ID = "naboah"

@router.get("/rooms", response_model=List[SynergyRoom])
async def list_rooms(db: Session = Depends(get_session)):
    return db.exec(select(SynergyRoom)).all()

@router.post("/rooms")
async def create_room(name: str, room_type: str = "canvas", db: Session = Depends(get_session)):
    room = SynergyRoom(
        id=f"room_{uuid.uuid4().hex[:6]}",
        tenant_id=TENANT_ID, # Mock
        name=name,
        type=room_type,
        created_by_id="u1" # Mock
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room

@router.websocket("/ws/{room_id}")
async def synergy_websocket(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            # Broadcast de cursores ou mudanças no canvas
            await manager.broadcast(room_id, {
                "type": "presence",
                "room_id": room_id,
                "payload": message
            })
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)

@router.post("/sticky-notes")
async def create_sticky(note: StickyNote, db: Session = Depends(get_session)):
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
