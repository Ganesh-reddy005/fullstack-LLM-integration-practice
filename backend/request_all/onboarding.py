from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from models import UserProfile, User
from services.active_user import get_current_user

router = APIRouter()

class OnboardingData(BaseModel):
    experience: str
    mission: str
    style: str
    block: str

@router.post("/complete")
async def complete_onboarding(
    data: OnboardingData, 
    current_user: User = Depends(get_current_user)
):
    # Find the profile linked to this user's token
    profile = await UserProfile.find_one(UserProfile.user_id == str(current_user.id))
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Save the answers
    profile.experience_level = data.experience
    profile.mission = data.mission
    profile.feedback_style = data.style
    profile.mental_block = data.block
    
    # Initialize an empty revision list if it doesn't exist
    if not profile.revision_list:
        profile.revision_list = []
        
    await profile.save()
    
    return {"status": "success"}