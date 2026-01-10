from fastapi import FastAPI
import asyncio
from pydantic import BaseModel,Field
from fastapi import HTTPException

app= FastAPI()
USER_DB =  {
    1:{'name':'Alice', 'progress':50},
    2: {'name':'Bob', 'progress':70},
    3:{'name':'Charlie', 'progress':90}
}
# Fake Problem Database
PROBLEMS = [
    {"id": 1, "title": "Two Sum", "difficulty": "easy"},
    {"id": 2, "title": "Reverse Linked List", "difficulty": "easy"},
    {"id": 3, "title": "Merge intervals", "difficulty": "medium"},
    {"id": 4, "title": "Binary Tree Maximum Path Sum", "difficulty": "hard"},
]

class Student_submission(BaseModel):
#enforcing constaints on the data
    """
- This saves us money because we dont call LLM_API_KEY befofre validating the data.
- Instead or AI responding i dont understand or halucinate we can give better error message
- security - instead of passing random text to LLM and maaxing out API usage we can validate first
"""
    student_id: int
    student_code: str = Field(..., min_length = 10, max_lenth = 2000) # ...means its - required field
    student_explanation: str = Field(..., min_length=20, max_legth=5000)




@app.get('/')
async def root():
    return {'message':'Welcome to the Student Code Analysis API'}

@app.post('/submit_code')
async def analyze_submission(submission: Student_submission):

    thinking_socre = len(submission.student_explanation) / 10

    data = {'status':'success',
            'message':f'Great!, let me analyze your code and explanation for question: {submission.student_id}',
            'thinking_score': thinking_socre
            }
    
    return data

#getting user data
@app.get('/profile/{user_id}')
async def get_user(user_id: int):
    if user_id in USER_DB:
        return USER_DB[user_id]
   # return {'error' : 'user not found'}
    raise HTTPException(status_code=404,detail = 'user not found')

@app.get('/problems')
async def get_problems(difficulty:str=None, limit: int = 10):
    if difficulty:
        filtered_probs = [prob for prob in PROBLEMS if prob['difficulty'] == difficulty.lower() ]
        return filtered_probs
    return PROBLEMS[:limit]

