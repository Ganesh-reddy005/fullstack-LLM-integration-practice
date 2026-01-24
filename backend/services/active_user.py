from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from models import User
from services.security import SECRET_KEY, ALGORITHM

# This tells FastAPI: "Look for the token in the Authorization header"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Decode the Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. Extract the User ID (we saved it as "sub" in auth.py)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    # 3. Find User in DB
    # We use Pydantic's ObjectId handling if you are using Beanie with ObjectIds, 
    # but since we stored IDs as strings in some places, let's look it up carefully.
    user = await User.get(user_id) # Beanie's .get() works with the ID directly
    
    if user is None:
        raise credentials_exception
        
    return user