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
        
        system_prompt = """
        *Thinking agent* - you make users think rather than giving direct answers.
        You are a world class teaching assistance helping students with DSA- data structures and algorithms related questions.
        when question is asked - you ask them back few questions."""
        response = await client.chat.completions.create(
            model = 'openai/gpt-oss-120b',
            messages=[
                {"role":"system" , "content":system_prompt},
                {"role":"user" , "content":request.message}
            ]
        )
        return { 'text':response.choices[0].message.content }
        
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))
    
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)