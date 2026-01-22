from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv
from request_all.onboarding import router as onboarding_router  # <--- NEW

# Load environment variables from .env
load_dotenv()

# --- IMPORTS ---
# 1. Import Database Models
from models import UserSubmission, ChatLog, UserProfile

# 2. Import Routers (Using your folder name 'request_all')
from request_all.code_submission import router as submission_router
from request_all.chat_request import router as chat_router

# --- LIFECYCLE MANAGER (Database Connection) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Runs before the app starts to connect to MongoDB.
    Runs after the app stops to close connections.
    """
    # 1. Get the URI
    mongo_uri = os.getenv("MONGODB_URI")
    
    if not mongo_uri:
        print("❌ CRITICAL ERROR: MONGODB_URI not found in .env file.")
        # We yield here to let the app start (so you see the error), 
        # but DB features will fail.
        yield
        return

    try:
        # 2. Initialize the Client
        client = AsyncIOMotorClient(mongo_uri)
        
        # 3. Select the Database
        # Note: You can change 'antinotes_db' to whatever name you want your DB to have in Atlas
        database = client.antinotes_db 
        
        # 4. Initialize Beanie (ODM)
        await init_beanie(database=database, document_models=[UserSubmission, ChatLog, UserProfile])
        
        print("✅ MongoDB Connected Successfully!")
        
    except Exception as e:
        print(f"❌ Database Connection Failed: {e}")

    yield
    # (Optional) Code to run on shutdown goes here
    print("🛑 Shutting down...")


# --- APP INITIALIZATION ---
app = FastAPI(
    title="AntiNotes.dev API",
    description="Backend engine for Agentic AI EdTech platform",
    version="0.1.0",
    lifespan=lifespan # <--- CRITICAL: This connects the DB logic to the App
)

# --- CORS MIDDLEWARE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROUTER REGISTRATION ---
app.include_router(submission_router, prefix="/submit", tags=["Submission"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(onboarding_router, prefix="/onboarding", tags=["Onboarding"]) # <--- NEW

# --- ROOT ENDPOINT (Health Check) ---
@app.get("/")
async def root():
    return {
        "message": "Welcome to AntiNotes.dev API",
        "status": "Running",
        "docs": "http://localhost:8000/docs"
    }

if __name__ == "__main__":
    import uvicorn
    # 0.0.0.0 allows access from other devices on the network; useful for testing
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)