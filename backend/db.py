from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from models import User, Event, EventChat
from config import settings

async def init_db():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    # Patch for Beanie 2.x which tries to call append_metadata on motor client
    if not hasattr(AsyncIOMotorClient, "append_metadata"):
        AsyncIOMotorClient.append_metadata = lambda *args, **kwargs: None

    await init_beanie(database=client.get_database("eventplan"), document_models=[User, Event, EventChat])
