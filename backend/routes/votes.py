from typing import List, Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from models import Event, User
from auth import get_current_user
from routes.notifications import notification_manager
import json

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, event_id: str, websocket: WebSocket):
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
        self.active_connections[event_id].append(websocket)

    def disconnect(self, event_id: str, websocket: WebSocket):
        if event_id in self.active_connections:
            self.active_connections[event_id].remove(websocket)

    async def broadcast(self, event_id: str, message: dict):
        if event_id in self.active_connections:
            for connection in self.active_connections[event_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@router.websocket("/ws/{event_id}")
async def websocket_endpoint(websocket: WebSocket, event_id: str):
    await manager.connect(event_id, websocket)
    try:
        while True:
            # We just need to keep the connection open for broadcasts.
            # Client will send votes via HTTP for validation, but we can also handle them here.
            data = await websocket.receive_text()
            # If we wanted to handle incoming WS votes:
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        manager.disconnect(event_id, websocket)

@router.post("/{event_id}/vote/{option_id}")
async def cast_vote(event_id: str, option_id: str, current_user: User = Depends(get_current_user)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.is_closed:
        raise HTTPException(status_code=400, detail="Voting is closed")
    
    user_id = str(current_user.id)
    # Remove previous vote from this user in this event
    for opt in event.voting_options:
        if user_id in opt.votes:
            opt.votes.remove(user_id)
    
    # Add new vote
    found = False
    for opt in event.voting_options:
        if opt.id == option_id:
            opt.votes.append(user_id)
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail="Option not found")
    
    await event.save()
    
    # Broadcast update
    await manager.broadcast(event_id, {
        "type": "vote_update",
        "voting_options": [opt.dict() for opt in event.voting_options]
    })
    
    # Global notification
    for participant_id in event.participants:
        if participant_id != str(current_user.id):
            await notification_manager.notify_user(
                user_id=participant_id,
                title="Voting update",
                message=f"Someone cast a vote in '{event.title}'!",
                metadata={"event_id": event_id, "type": "vote"}
            )
    
    return {"message": "Vote cast"}
