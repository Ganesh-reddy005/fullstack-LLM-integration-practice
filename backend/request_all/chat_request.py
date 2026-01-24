from fastapi import APIRouter, HTTPException
from models import ChatRequest
from services.llm_service import get_llm_response

router = APIRouter()

@router.post("/")
async def chat_with_ai(payload: ChatRequest):
    try:
        # 1. Extract data from the validated Pydantic model
        user_msg = payload.message
        user_history = payload.history # This is the array of last 5 user messages
        
        # 2. Build the history context for the LLM
        # We join the previous user questions to give the AI context
        context_string = "\n".join([f"User past question: {q}" for q in user_history])
        
        # Prepare the final prompt
        full_prompt = f"Conversation History:\n{context_string}\n\nCurrent Question: {user_msg}"
        
        # 3. Call the LLM Service
        system_instruction = "You are the AntiNotes.dev AI. Be concise and mentor-like."
        ai_response = await get_llm_response(system_instruction, full_prompt)
        
        # 4. Return response matching frontend expectation: data.text
        return {
            "status": "success",
            "text": ai_response 
        }
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="AI Assistant is temporarily unavailable.")