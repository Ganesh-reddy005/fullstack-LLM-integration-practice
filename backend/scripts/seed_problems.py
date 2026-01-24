# scripts/seed_problems.py
import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from datasets import load_dataset
# Fix import path for models
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models import Problem

async def seed():
    print("1. Connecting to DB...")
    load_dotenv()
    client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
    await init_beanie(database=client.antinotes_db, document_models=[Problem])

    print("2. Fetching Dataset from Hugging Face...")
    # This dataset has real LeetCode problems
    dataset = load_dataset("newfacade/LeetCodeDataset", split="train")
    
    # Let's take 5 Easy, 5 Medium, 5 Hard
    counts = {"Easy": 0, "Medium": 0, "Hard": 0}
    limit = 5
    
    problems_to_save = []

    for row in dataset:
        diff = row['difficulty']
        if counts[diff] >= limit:
            continue
            
        print(f"   -> Found {diff}: {row['task_id']}")
        
        # Clean up description (sometimes it has weird HTML)
        desc = row['problem_description'].replace("<p>", "").replace("</p>", "\n")

        p = Problem(
            problem_id=row['task_id'], # e.g., "two-sum"
            title=row['task_id'].replace("-", " ").title(),
            difficulty=diff,
            description=desc,
            starter_code=row['starter_code'],
            test_cases=row['test'] # We store this but don't show user!
        )
        problems_to_save.append(p)
        counts[diff] += 1
        
        if all(c >= limit for c in counts.values()):
            break

    print(f"3. Saving {len(problems_to_save)} problems to MongoDB...")
    for p in problems_to_save:
        # Upsert (Update if exists, Insert if new)
        existing = await Problem.find_one(Problem.problem_id == p.problem_id)
        if not existing:
            await p.insert()
            
    print("✅ Database Seeded!")

if __name__ == "__main__":
    asyncio.run(seed())