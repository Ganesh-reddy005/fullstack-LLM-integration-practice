from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from dotenv import load_dotenv
import os
load_dotenv()

# 1. CONFIGURATION (In production, load these from .env!)
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("No SECRET_KEY found in .env file")
ALGORITHM = os.getenv('ALGORITHM')
if not ALGORITHM:
    raise ValueError("No ALGORITHM found in .env file")
ACCESS_TOKEN_EXPIRE_MINUTES = 300 # 5 hours for testing

# 2. PASSWORD HASHER (The "Meat Grinder")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Checks if the typed password matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Scrambles the password before saving to DB."""
    return pwd_context.hash(password)

# 3. TOKEN GENERATOR (The "Passport Printer")
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt