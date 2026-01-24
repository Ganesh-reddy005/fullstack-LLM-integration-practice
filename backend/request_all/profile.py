from fastapi import APIRouter, HTTPException, Depends
from models import UserProfile, User, RevisionItem
from services.active_user import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter()

# --- 1. DEFINE THE RESPONSE MODEL (The Missing Piece) ---
class DashboardResponse(BaseModel):
    user_id: str
    experience_level: str
    mission: str
    current_skill_level: int
    thinking_style: str
    mental_block: str
    weaknesses: List[str]
    revision_list: List[RevisionItem]

# --- 2. THE PROTECTED ROUTE ---
# Note: URL is "/me", and we use 'current_user' dependency
@router.get("/me", response_model=DashboardResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    
    # We find the profile linked to the currently logged-in user's ID
    profile = await UserProfile.find_one(UserProfile.user_id == str(current_user.id))
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile data not found for this user")
    
    return profile