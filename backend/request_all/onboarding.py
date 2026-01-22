import traceback
from fastapi import APIRouter, HTTPException
import os, sys
from services.llm_service import get_llm_response
from datetime import datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import OnboardingRequest, UserProfile
router = APIRouter()

@router.post("/")
async def save_user_profile(payload: OnboardingRequest):
    # 1. DEBUG PRINT: Check what data is actually arriving
    print(f"📥 Received Payload: {payload.model_dump()}") 

    try:
        # 2. AI Analysis
        analysis_prompt = (
            f"A coding student said their biggest barrier is: '{payload.q4_struggle}'. "
            "Summarize this into a single, short 'Mental Block' label (max 3-5 words). "
            "Return ONLY the label."
        )
        
        mental_block_tag = await get_llm_response(
            system_prompt="You are a psychological profiler for engineers.",
            user_content=analysis_prompt
        )
        print(f"🤖 AI Mental Block: {mental_block_tag}")

        # 3. DB Operation
        # Verify UserProfile is loaded correctly
        print("🔍 Searching for existing user...")
        existing_user = await UserProfile.find_one(UserProfile.user_id == payload.user_id)
        
        if existing_user:
            print("📝 Updating existing user...")
            existing_user.experience_level = payload.q1_level
            existing_user.mission = payload.q2_mission
            existing_user.feedback_style = payload.q3_style
            existing_user.mental_block = mental_block_tag
            existing_user.updated_at = datetime.utcnow()
            await existing_user.save()
            message = "Profile updated."
        else:
            print("✨ Creating new user...")
            new_profile = UserProfile(
                user_id=payload.user_id,
                experience_level=payload.q1_level,
                mission=payload.q2_mission,
                feedback_style=payload.q3_style,
                mental_block=mental_block_tag,
                # Defaults
                current_skill_level=1,
                strengths=[],
                weaknesses=[],
                thinking_style="Uncalibrated"
            )
            await new_profile.insert()
            message = "Profile created."
            
        print("✅ Success!")
        return {
            "status": "success", 
            "message": message, 
            "mental_block_detected": mental_block_tag
        }

    except Exception as e:
        # PRINT THE FULL STACK TRACE
        print("❌ CRITICAL ERROR IN ONBOARDING:")
        traceback.print_exc() 
        raise HTTPException(status_code=500, detail=f"Backend Error: {str(e)}")