from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from models import Event, User, VotingOption
from auth import get_current_user
from routes.notifications import notification_manager
from pydantic import BaseModel

router = APIRouter()

class EventCreate(BaseModel):
    title: str
    description: str
    date: datetime
    location: str
    voting_options: List[str] = []

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    location: Optional[str] = None
    voting_options: Optional[List[str]] = None
    is_closed: Optional[bool] = None

@router.post("/")
async def create_event(event_in: EventCreate, current_user: User = Depends(get_current_user)):
    options = [VotingOption(id=str(i), text=text) for i, text in enumerate(event_in.voting_options)]
    new_event = Event(
        title=event_in.title,
        description=event_in.description,
        date=event_in.date,
        location=event_in.location,
        organizer_id=str(current_user.id),
        voting_options=options
    )
    await new_event.insert()
    print(f"EVENT: New event created: {new_event.title} by {current_user.username}")
    return new_event

@router.get("/", response_model=List[Event])
async def list_events(search: Optional[str] = None):
    if search:
        print(f"QUERY: Search performed with term: {search}")
        return await Event.find({"$or": [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]}).to_list()
    return await Event.find_all().to_list()

@router.get("/{event_id}", response_model=Event)
async def get_event(event_id: str):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

@router.put("/{event_id}")
async def update_event(event_id: str, event_in: EventUpdate, current_user: User = Depends(get_current_user)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.organizer_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = event_in.dict(exclude_unset=True)
    
    if "voting_options" in update_data:
        new_texts = update_data.pop("voting_options")
        # Preserve votes if text matches exactly, otherwise create new
        old_options = {opt.text: opt.votes for opt in event.voting_options}
        event.voting_options = [
            VotingOption(id=str(i), text=text, votes=old_options.get(text, [])) 
            for i, text in enumerate(new_texts)
        ]
        
    for key, value in update_data.items():
        setattr(event, key, value)
        
    await event.save()
    
    # Notify participants about changes if critical (like status or major edit)
    # For now, we notify on every update to be safe and responsive
    for participant_id in event.participants:
        if participant_id != str(current_user.id):
            await notification_manager.notify_user(
                user_id=participant_id,
                title="Event updated",
                message=f"'{event.title}' parameters have shifted.",
                metadata={"event_id": event_id, "type": "event_update"}
            )
            
    print(f"EVENT: Event updated: {event.title} by {current_user.username}")
    return event

@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.organizer_id != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await event.delete()
    print(f"EVENT: Event deleted: {event.title} by {current_user.username}")
    return {"message": "Event deleted"}

@router.post("/{event_id}/join")
async def join_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if str(current_user.id) in event.participants:
        return {"message": "Already joined"}
    event.participants.append(str(current_user.id))
    await event.save()
    print(f"EVENT: User {current_user.username} joined event {event.title}")
    return {"message": "Joined successfully"}

@router.post("/{event_id}/leave")
async def leave_event(event_id: str, current_user: User = Depends(get_current_user)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if str(current_user.id) not in event.participants:
        return {"message": "Not a participant"}
    event.participants.remove(str(current_user.id))
    await event.save()
    print(f"EVENT: User {current_user.username} left event {event.title}")
    return {"message": "Left successfully"}
@router.get("/{event_id}/participants")
async def get_event_participants(event_id: str):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    participants = []
    for user_id in event.participants:
        user = await User.get(user_id)
        if user:
            participants.append({"id": str(user.id), "username": user.username})
    return participants
