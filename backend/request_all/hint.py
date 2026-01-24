import json
from fastapi import APIRouter, HTTPException, Depends
from models import UserProfile, Problem, HintRequest, User
from services.llm_service import get_llm_response
from services.active_user import get_current_user # <--- THE GUARD

router = APIRouter()

@router.post("/")
async def get_hint(
    payload: HintRequest,
    current_user: User = Depends(get_current_user) # <--- Extract User from Token
):
    # 1. Fetch Context using the Token ID (Secure)
    # We ignore payload.user_id (it doesn't exist anymore) and use current_user.id
    user_id = str(current_user.id)
    
    user = await UserProfile.find_one(UserProfile.user_id == user_id)
    problem = await Problem.find_one(Problem.problem_id == payload.problem_id)
    
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    # 2. Build the "Socratic" Prompt
    system_prompt = (
        "You are a Socratic Tutor for a coding student.\n"
        f"Problem: {problem.title}\n"
        f"Description: {problem.description}\n"
        "RULES:\n"
        "1. Read the student's incomplete code.\n"
        "2. Answer their specific question OR identify the next logical step.\n"
        "3. DO NOT write code. DO NOT solve it. Give a conceptual hint only.\n"
        "4. Keep it short.\n"
    )

    # 3. Add User Persona (Voice) if available
    if user:
        # Fallback if profile exists but has no style set
        style = getattr(user, "feedback_style", "Supportive Coach")
        weaknesses = getattr(user, "weaknesses", [])
        system_prompt += f"Tone: {style}. Speak to their weakness: {', '.join(weaknesses[:2])}."

    # 4. Call AI
    response = await get_llm_response(
        system_prompt=system_prompt,
        user_content=f"Student Code:\n{payload.code}\n\nStudent Question: {payload.user_question}",
        json_mode=False # We just want raw text
    )

    return {"hint": response}