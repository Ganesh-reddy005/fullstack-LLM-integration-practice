# requests_all/problems.py
from fastapi import APIRouter, HTTPException
from typing import List
from models import Problem
from pydantic import BaseModel

router = APIRouter()

# Response Model (So we don't send hidden test cases to the frontend!)
class ProblemSummary(BaseModel):
    problem_id: str
    title: str
    difficulty: str

class ProblemDetail(BaseModel):
    problem_id: str
    title: str
    difficulty: str
    description: str
    starter_code: str

@router.get("/", response_model=List[ProblemSummary])
async def get_all_problems():
    # Return a lightweight list (ID, Title, Difficulty) for the menu
    return await Problem.find_all().project(ProblemSummary).to_list()

@router.get("/{problem_id}", response_model=ProblemDetail)
async def get_problem_details(problem_id: str):
    problem = await Problem.find_one(Problem.problem_id == problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem