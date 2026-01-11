from fastapi import FastAPI, HTTPException
from pydantic import BaseModel,Field
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI # be verycareful about import names -> AsyncOpenAI because we are using async functions
import os


app=FastAPI()
from dotenv import load_dotenv
load_dotenv()
#schemas
class ChatRequest(BaseModel):
    message: str=Field(...,max_length=2000,description="User's message to the chatbot")
    history :list[str]=Field(default=[],description="Conversation history between user and chatbot")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],  # Adjust as needed
    allow_credentials=True, # Allow cookies and credentials
    allow_methods=["*"], # Allow all HTTP methods
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"),
                #adding url with grok endpoint
                base_url="https://api.groq.com/openai/v1"
                )

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        if not client.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key is not configured.")
        
        # Construct the history string to show the user's path
        formatted_history = "\n".join([f"- User asked: {msg}" for msg in request.history[:-1]])
        
        system_instruction = f"""
        YOU ARE A COGNITIVE MENTOR for DSA.
        
        USER'S RECENT JOURNEY:
        {formatted_history if formatted_history else "This is the start of the session."}
        
        CURRENT CHALLENGE:
        The user just said: "{request.message}"
        
        RULES:
        1. Analyze the journey above. If the user is repeating a mistake, point it out subtly.
        2. NEVER give the answer.
        3. If the user asks "Why?", look at their past questions to see where their logic is breaking.
        4. Focus on increasing their "Thinking Capacity."
        # give output in pure text format only no markdown, when ever needed use bullet points for steps example -,* etc.
        """

        response = await client.chat.completions.create(
            model = 'openai/gpt-oss-120b',
            messages=[
                {"role":"system" , "content":system_instruction},
                {"role":"user" , "content":request.message}
            ]
        )
        
        return { 'text':response.choices[0].message.content }
        
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
    
# to make sure it only runs when executed directly in this file
# and not when imported as a module
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)