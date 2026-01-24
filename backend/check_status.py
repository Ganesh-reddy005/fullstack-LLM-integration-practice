import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie

# Try importing the model
print("1. Testing Import...")
try:
    from models import UserProfile
    print("✅ 'models.py' imported successfully.")
except ImportError as e:
    print(f"❌ Import Failed: {e}")
    print("   Make sure 'models.py' is in the same folder as this script.")
    exit()

# Check if user_id exists in the class
print("\n2. Checking UserProfile definition...")
if hasattr(UserProfile, 'user_id'):
    print("✅ 'user_id' field found in UserProfile.")
else:
    print("❌ 'user_id' MISSING from UserProfile class.")
    print("   Please edit 'models.py' and ensure 'user_id: str = Field(...)' is defined.")
    # Print what fields ARE there to help debug
    print(f"   Fields found: {UserProfile.model_fields.keys()}")
    exit()

# Test Database Connection
async def test_db():
    print("\n3. Testing Database Connection...")
    load_dotenv()
    mongo_uri = os.getenv("MONGODB_URI")
    
    if not mongo_uri:
        print("❌ MONGODB_URI missing from .env")
        return

    try:
        client = AsyncIOMotorClient(mongo_uri)
        db = client.antinotes_db
        await init_beanie(database=db, document_models=[UserProfile])
        print("✅ Database Connected & Beanie Initialized!")
        
        # Try a dummy query
        print("4. Testing Query...")
        user = await UserProfile.find_one(UserProfile.user_id == "test_connection")
        print("✅ Query ran successfully (It's okay if result is None).")
        
    except Exception as e:
        print(f"❌ Database Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_db())