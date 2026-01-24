from models import UserProfile

try:
    # We just try to access the field definition. 
    # If this fails, your schema.py file is definitely the issue.
    print(f"Checking schema... Field found: {UserProfile.user_id}")
    print("✅ Schema is VALID. The issue is likely the running server cache.")
except AttributeError:
    print("❌ Schema is BROKEN. Python cannot see 'user_id' in UserProfile.")
    print("Please check indentation in schema.py")