import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def get_llm_response(system_prompt: str, user_content: str, json_mode: bool = False):
    """
    Core function to communicate with the LLM via Groq.
    """
    try:
        # 1. Prepare the format based on the json_mode flag
        # Groq expects this structure to enable JSON enforcement
        response_format = {"type": "json_object"} if json_mode else {"type": "text"}

        response = await client.chat.completions.create(
            model="openai/gpt-oss-20b", # Note: Ensure your Groq model name is correct
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            response_format=response_format 
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"