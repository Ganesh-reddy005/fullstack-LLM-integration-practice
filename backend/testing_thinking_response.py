from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
import uvicorn
import os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"),
                     base_url="https://api.groq.com/openai/v1"
                    )

# SIMULATED DATABASE: Complete details about the user
# In your real platform, this would be fetched based on a User ID
mock_user_db = {
    "name": "Aryan",
    "level": "Intermediate",
    "past_struggles": ["Recursion", "Time Complexity analysis"],
    "learning_style": "Visual/Socratic",
    "current_goal": "Mastering Dynamic Programming for DSA"
}

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # AGENTIC LOGIC: Build the System Prompt using User Data
        system_instruction = f"""
        USER CONTEXT:
        - Name: {mock_user_db['name']}
        - Skill Level: {mock_user_db['level']}
        - Struggles: {mock_user_db['past_struggles']}
        
        YOUR CORE MANDATE:
        1. NEVER give the direct answer or the full approach.
        2. Focus on "Increasing the user's ability to think."
        3. Use Socratic questioning. If they ask for help with a problem, ask them to identify the sub-problems or the base case.
        4. Emotional Support: Be tangible and supportive. Use phrases like "I see where you're coming from" or "That's a common hurdle for intermediate learners."
        5. Recall their struggles: If they struggle with {mock_user_db['past_struggles'][0]}, guide them specifically through that logic.
        """

        response = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": request.message}
            ]
        )
        
        ai_thinking_response = response.choices[0].message.content
        return {"text": ai_thinking_response}

    except Exception as e:
        return {"text": f"System Error: {str(e)}"}
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0",port=8000)