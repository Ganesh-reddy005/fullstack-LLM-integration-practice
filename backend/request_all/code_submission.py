import json, pathlib, ast
from fastapi import APIRouter, HTTPException, Depends
from models import CodeSubmissionRequest, UserSubmission, UserProfile, Problem, RevisionItem, User
from services.llm_service import get_llm_response
from services.active_user import get_current_user # <--- IMPORT THE GUARD

router = APIRouter()

def validate_syntax(code: str):
    try:
        ast.parse(code)
        return True, None
    except SyntaxError as e:
        return False, f"Syntax Error on line {e.lineno}: {e.msg}"
    except Exception as e:
        return False, f"Compiler Error: {str(e)}"

def load_base_prompt():
    prompt_path = pathlib.Path("prompt_for_submission.md")
    if not prompt_path.exists():
        return "Review the following code and provide feedback in JSON format."
    return prompt_path.read_text()

@router.post("/")
async def submit_code(
    payload: CodeSubmissionRequest, 
    current_user: User = Depends(get_current_user) # <--- GET USER FROM TOKEN
):
    try:
        # 1. Compiler Check
        is_valid, compiler_error = validate_syntax(payload.code)
        if not is_valid:
            print(f"Blocked invalid syntax: {compiler_error}")
            return {
                "status": "success",
                "evaluation": {
                    "score": 0,
                    "feedback": f"🚨 **Compiler Error**\n\nI couldn't run your code because of a syntax error:\n> `{compiler_error}`\n\nFix this before I can review your logic!",
                    "bottlenecks": ["Syntax Error"],
                    "suggested_level": 1,
                    "thinking_style": "Uncompiled",
                    "revision_card": None
                }
            }

        # 2. Fetch User Profile using the ID from the Token
        user_id = str(current_user.id) # <--- USE TOKEN ID
        user_profile = await UserProfile.find_one(UserProfile.user_id == user_id)
        problem = await Problem.find_one(Problem.problem_id == payload.problem_id)
        
        # 3. Build Context
        dynamic_context = ""
        if user_profile:
            dynamic_context = (
                f"\n\n--- USER CONTEXT (CRITICAL) ---\n"
                f"Student Level: {user_profile.experience_level}\n"
                f"Current Mission: {user_profile.mission}\n"
                f"Mental Block: {user_profile.mental_block}\n"
                f"Known Weaknesses: {', '.join(user_profile.weaknesses)}\n"
                f"Thinking Style: {user_profile.thinking_style}\n"
                f"REQUIRED PERSONA: {user_profile.feedback_style}\n"
                f"------------------------------\n"
            )
        else:
            dynamic_context = "\nUser Context: Beginner student. Be supportive but technical."

        # 4. Prompt Construction
        rubric_instructions = (
            "\n\n--- EVALUATION RUBRIC ---\n"
            "Evaluate the user's code on a scale of 0-100 based on:\n"
            "1. CORRECTNESS (40pts): Does it solve the problem logically?\n"
            "2. EFFICIENCY (30pts): Is the Time Complexity optimal?\n"
            "3. CLEANLINESS (20pts): Variable naming, spacing, pythonic style.\n"
            "4. APPROACH (10pts): Did they use the right pattern (e.g. Recursion)?\n"
            "5. REVISION DATA (Crucial): If score < 100, provide a 'revision_card' object.\n"
            "\n"
            "Output JSON with keys: 'score', 'feedback', 'bottlenecks', 'thinking_style', "
            "and 'revision_card' (optional)."
        )

        base_prompt = load_base_prompt()
        full_system_prompt = base_prompt + dynamic_context + rubric_instructions
        
        user_content_safe = (
            f"Language: {payload.language}\n"
            f"Problem: {problem.title if problem else 'Unknown'}\n"
            f"<student_code>\n{payload.code}\n</student_code>"
        )

        # 5. Call LLM
        ai_raw_string = await get_llm_response(
            system_prompt=full_system_prompt, 
            user_content=user_content_safe,
            json_mode=True 
        )
        
        evaluation_data = json.loads(ai_raw_string)
        
        # 6. Save Submission (Using ID from Token)
        submission_doc = UserSubmission(
            user_id=user_id, # <--- FIXED
            user_code=payload.code,
            language=payload.language,
            problem_id=payload.problem_id,
            score=evaluation_data.get("score", 0),
            feedback=evaluation_data.get("feedback", "No feedback"),
            suggested_level=evaluation_data.get("suggested_level", 1),
            bottlenecks=evaluation_data.get("bottlenecks", [])
        )
        await submission_doc.insert()
        
        # 7. Update Profile
        if user_profile:
            if evaluation_data.get("bottlenecks"):
                new_bottlenecks = evaluation_data["bottlenecks"]
                current_set = set(user_profile.weaknesses)
                for b in new_bottlenecks:
                    current_set.add(b)
                user_profile.weaknesses = list(current_set)[:10]
            
            user_profile.current_skill_level = evaluation_data.get("suggested_level", user_profile.current_skill_level)
            if evaluation_data.get("thinking_style"):
                user_profile.thinking_style = evaluation_data["thinking_style"]
            
            rev_data = evaluation_data.get("revision_card")
            if rev_data and problem:
                new_item = RevisionItem(
                    problem_id=problem.problem_id,
                    problem_title=problem.title,
                    mistake_summary=rev_data.get("mistake_summary", "Review required"),
                    concepts=rev_data.get("concepts", [])
                )
                user_profile.revision_list.insert(0, new_item)
                user_profile.revision_list = user_profile.revision_list[:50]

            await user_profile.save()

        return {
            "status": "success",
            "evaluation": evaluation_data
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON.")
    except Exception as e:
        print(f"Submission Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))