## Onboarding error
* we were getting error while import userprofile model. 
* was caused due to - The UserProfile model was not registered with Beanie (your MongoDB ODM) during application startup.    
* Also import errors in main.py file. 
### Learning  
**Why this caused the error:**. 
Beanie needs to know about all Document models at startup to properly map them to MongoDB collections. When you tried to use UserProfile.user_id in a query without registering it, Beanie couldn't understand the class attributes, causing the AttributeError.  
**How to fix:**    
Register the Document models with Beanie during application startup. 
```python
await init_beanie(database=database, document_models=[UserSubmission, ChatLog, UserProfile])
```