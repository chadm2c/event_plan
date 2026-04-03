import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import init_db
from routes import auth, events, votes, admin, chat, notifications

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("eventplan")

app = FastAPI(title="EventPlan API")

# CORS Configuration for SPA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(votes.router, prefix="/votes", tags=["Voting"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])

@app.get("/health")
async def health_check():
    return {"status": "operational", "timestamp": datetime.utcnow()}

@app.get("/")
async def root():
    return {"message": "Welcome to EventPlan API"}
