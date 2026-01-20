from fastapi import APIRouter, HTTPException
from schema import CodeSubmissionRequest
from services.llm_service import get_llm_response
import pathlib
import json # New import for parsing the AI response
def load_prompt():
    # If main.py is in the root, and this file is in requests_all/, 
    # it might not find the file in the root directory.
    prompt_path = pathlib.Path("prompt_for_submission.md") 
    
    if not prompt_path.exists():
        # This fallback might not be triggered if read_text() was called earlier
        return "Review the following code and provide feedback in JSON format."
    return prompt_path.read_text()

router = APIRouter()


@router.post("/")
async def submit_code(payload: CodeSubmissionRequest):
    try:
        system_prompt = load_prompt() # Loads prompt_for_submission.md
        
        # Call the LLM with json_mode=True to get structured feedback
        ai_raw_string = await get_llm_response(
            system_prompt=system_prompt+ "\nRespond strictly in JSON format.", 
            user_content=f"Code:\n{payload.code}",
            json_mode=True 
        )
        
        # Parse into a dictionary so the frontend gets an object
        analysis_data = json.loads(ai_raw_string)
        
        return {
            "status": "success",
            "evaluation": analysis_data 
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))