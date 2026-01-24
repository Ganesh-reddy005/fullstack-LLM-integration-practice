from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from models import User,UserProfile
from services.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

# --- Request Models (What the user sends us) ---
class UserAuth(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str # Sending this back helps the frontend know who logged in

# --- 1. REGISTRATION ENDPOINT ---
@router.post("/register", response_model=Token)
async def register(user_data: UserAuth):
    # A. Check if user already exists
    existing_user = await User.find_one(User.email == user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    # B. Hash the password (NEVER save plain text!)
    hashed_pwd = get_password_hash(user_data.password)
    
    # C. Save to DB
    new_user = User(
        email=user_data.email, 
        hashed_password=hashed_pwd
    )
    await new_user.insert()
    # Create an initial UserProfile with default values
    #NEW: Create the Gamified Profile automatically!
    initial_profile = UserProfile(
        user_id=str(new_user.id),
        experience_level="Explorer",
        mission="Just Starting",
        feedback_style="Supportive Mentor",
        mental_block="None yet",
        current_skill_level=1,
        weaknesses=[],
        thinking_style="Uncalibrated"
    )
    await initial_profile.insert()
    
    # D. Auto-login: Generate a token immediately so they don't have to log in again
    # We use the new user's MongoDB ID as the 'sub' (subject) of the token
    access_token = create_access_token(
        data={"sub": str(new_user.id)} 
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(new_user.id)
    }

# --- 2. LOGIN ENDPOINT ---
@router.post("/login", response_model=Token)
async def login(user_data: UserAuth):
    # A. Find User
    user = await User.find_one(User.email == user_data.email)
    if not user:
        # Security Tip: Don't say "User not found", say "Invalid credentials"
        # so hackers can't guess which emails exist.
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # B. Check Password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # C. Generate Token
    access_token = create_access_token(
        data={"sub": str(user.id)}
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": str(user.id)
    }