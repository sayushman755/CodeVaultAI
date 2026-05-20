import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

client = Groq(api_key=GROQ_API_KEY)


def generate_code_explanation(title: str, problem_statement: str, language: str, code: str):
    prompt = f"""
You are an expert coding mentor.

Explain the given code in a beginner-friendly way.

Problem Title:
{title}

Problem Statement:
{problem_statement}

Programming Language:
{language}

Code:
{code}

Return only valid JSON. Do not add markdown. Do not add extra text.

JSON format:
{{
  "line_by_line_explanation": [
    {{
      "line": 1,
      "code": "actual code line",
      "explanation": "simple explanation of this line"
    }}
  ],
  "summary": "short summary of the full code",
  "time_complexity": "time complexity",
  "space_complexity": "space complexity",
  "interview_explanation": "simple interview-style explanation"
}}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful coding mentor. Always return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=2000
    )

    ai_text = response.choices[0].message.content

    try:
        return json.loads(ai_text)
    except json.JSONDecodeError:
        return {
            "raw_response": ai_text,
            "warning": "AI response was not valid JSON. Showing raw response instead."
        }