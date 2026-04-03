from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from models import User
from auth import create_access_token, get_password_hash, verify_password, get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter()

class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

class UserProfileUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

import logging
logger = logging.getLogger("eventplan.auth")

@router.post("/register")
async def register(user_in: UserCreate):
    existing_user = await User.find_one(User.username == user_in.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        role="user"
    )
    await new_user.insert()
    logger.info(f"New user registered: {new_user.username}")
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.username == form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    logger.info(f"User logged in: {user.username}")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role
    }

@router.put("/me")
async def update_profile(profile: UserProfileUpdate, current_user: User = Depends(get_current_user)):
    if profile.email:
        current_user.email = profile.email
    if profile.password:
        current_user.password_hash = get_password_hash(profile.password)
    await current_user.save()
    return {"message": "Profile updated"}
