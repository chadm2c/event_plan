from typing import List, Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from auth import get_current_user
from models import User
import json
import logging

logger = logging.getLogger("eventplan.notifications")
router = APIRouter()

class NotificationManager:
    def __init__(self):
        # user_id -> List of active WebSockets (user might have multiple tabs)
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected to notification hub")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from notification hub")

    async def notify_user(self, user_id: str, title: str, message: str, metadata: dict = None):
        if user_id in self.active_connections:
            payload = {
                "type": "global_notification",
                "title": title,
                "message": message,
                "metadata": metadata or {}
            }
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(payload))
                except Exception as e:
                    logger.error(f"Error sending notification to user {user_id}: {e}")

notification_manager = NotificationManager()

@router.websocket("/ws")
async def websocket_notifications(
    websocket: WebSocket, 
    token: str = Query(...)
):
    # Manual token verification for WS since standard Depends(get_current_user) 
    # might be tricky with query params vs headers in some WS clients.
    from auth import decode_access_token
    from models import User
    
    try:
        payload = decode_access_token(token)
        if not payload:
            await websocket.close(code=1008)
            return
            
        username = payload.get("sub")
        user = await User.find_one(User.username == username)
        if not user:
            await websocket.close(code=1008)
            return
            
        user_id = str(user.id)
        await notification_manager.connect(user_id, websocket)
        
        while True:
            # Keep connection alive, listen for pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
                
    except WebSocketDisconnect:
        notification_manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"Notification WS Error: {e}")
        await websocket.close(code=1011)
