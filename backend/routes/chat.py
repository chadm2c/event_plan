from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from typing import List, Dict
import json
from models import EventChat, Message, Event, User
from auth import get_current_user
from routes.notifications import notification_manager

router = APIRouter()

class ChatConnectionManager:
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

chat_manager = ChatConnectionManager()

@router.get("/{event_id}", response_model=List[Message])
async def get_chat_history(event_id: str, current_user: User = Depends(get_current_user)):
    chat = await EventChat.find_one(EventChat.event_id == event_id)
    if not chat:
        return []
    return chat.messages

from fastapi.encoders import jsonable_encoder

@router.post("/{event_id}", response_model=Message)
async def post_message(event_id: str, content: str, current_user: User = Depends(get_current_user)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    chat = await EventChat.find_one(EventChat.event_id == event_id)
    if not chat:
        chat = EventChat(event_id=event_id, messages=[])
        await chat.insert()
        
    new_message = Message(
        user_id=str(current_user.id),
        username=current_user.username,
        content=content
    )
    chat.messages.append(new_message)
    await chat.save()
    
    # Send global notifications to all participants (except the sender)
    for participant_id in event.participants:
        if participant_id != str(current_user.id):
            await notification_manager.notify_user(
                user_id=participant_id,
                title=f"New message in {event.title}",
                message=f"{current_user.username}: {content[:30]}...",
                metadata={"event_id": event_id, "type": "chat"}
            )
    
    # Then broadcast to the local room
    await chat_manager.broadcast(event_id, {
        "type": "new_message",
        "message": jsonable_encoder(new_message)
    })
    
    return new_message

@router.websocket("/ws/{event_id}")
async def websocket_chat_endpoint(websocket: WebSocket, event_id: str):
    await chat_manager.connect(event_id, websocket)
    try:
        while True:
            # We generally receive via HTTP POST and broadcast here,
            # but we can receive live ping/pongs too.
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        chat_manager.disconnect(event_id, websocket)
