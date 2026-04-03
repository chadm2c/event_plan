from typing import List, Optional
from datetime import datetime
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field

class User(Document):
    username: Indexed(str, unique=True)
    password_hash: str
    email: EmailStr
    role: str = "user" # user, admin
    is_blocked: bool = False

    class Settings:
        name = "users"

class VotingOption(BaseModel):
    id: str
    text: str
    votes: List[str] = [] # list of user_ids

class Event(Document):
    title: str
    description: str
    date: datetime
    location: str
    organizer_id: str
    participants: List[str] = [] # list of user_ids
    voting_options: List[VotingOption] = []
    is_closed: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "events"

class Message(BaseModel):
    user_id: str
    username: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class EventChat(Document):
    event_id: str
    messages: List[Message] = []

    class Settings:
        name = "chats"
