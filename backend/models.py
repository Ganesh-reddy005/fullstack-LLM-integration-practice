from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from beanie import Document

# --- 1. DATABASE MODELS (Stored in MongoDB) ---


class User(Document):
    email: EmailStr = Field(..., unique=True)
    hashed_password: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class RevisionItem(BaseModel):
    problem_id: str 
    problem_title: str
    mistake_summary: str  # e.g. "Forgot to handle negative numbers"
    concepts: List[str]   # e.g. ["Edge Cases", "Math"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
class UserProfile(Document):
    """
    The Living Profile.
    """
    # Indentation is CRITICAL here (4 spaces)
    user_id: str = Field(..., unique=True)
    
    # Static Identity
    experience_level: str
    mission: str
    feedback_style: str
    mental_block: str
    
    # Dynamic Coding DNA 
    current_skill_level: int = Field(default=1)
    strengths: List[str] = []
    weaknesses: List[str] = []
    thinking_style: str = "Uncalibrated"
    revision_list: List[RevisionItem] = []
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_profiles"

class UserSubmission(Document):
    user_id: str
    user_code: str
    language: str
    problem_id: str
    score: int
    feedback: str
    suggested_level: int
    bottlenecks: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "submissions"

class ChatLog(Document):
    user_id: Optional[str] = None
    user_message: str
    ai_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "chat_logs"


# --- 2. API REQUEST MODELS ---

class OnboardingRequest(BaseModel):
    user_id: str
    q1_level: str
    q2_mission: str
    q3_style: str
    q4_struggle: str 

class CodeSubmissionRequest(BaseModel):
    code: str = Field(..., min_length=10)
    language: str = Field(default="python")
    problem_id: str

class ChatRequest(BaseModel):
    user_id: Optional[str] = None 
    message: str = Field(..., max_length=1000)
    history: List[str] = Field(default=[])


class Problem(Document):
    problem_id: str = Field(..., unique=True) # e.g., "two-sum"
    title: str
    difficulty: str # "Easy", "Medium", "Hard"
    description: str
    starter_code: str # "def twoSum(nums, target): ..."
    test_cases: str # Hidden assertion code
    
    class Settings:
        name = "problems"


class HintRequest(BaseModel):
    problem_id: str
    code: str
    user_question: str = "I am stuck. Give me a hint."