from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from ws_manager import manager
import logging

router = APIRouter(prefix="/live", tags=["live"])

@router.websocket("/ws/{tenant_id}")
async def websocket_endpoint(websocket: WebSocket, tenant_id: str):
    await manager.connect(websocket, tenant_id)
    try:
        # Send initial connection success pulse
        await manager.send_personal_message(
            '{"type": "connection_established", "status": "pulse_active"}', 
            websocket
        )
        
        while True:
            # Keep connection alive and listen for optional client events
            data = await websocket.receive_text()
            # Echo or handle specific pulses from client (typing, etc.)
            await manager.broadcast_to_tenant(tenant_id, {
                "type": "heartbeat",
                "client_data": data
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket, tenant_id)
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
        manager.disconnect(websocket, tenant_id)
