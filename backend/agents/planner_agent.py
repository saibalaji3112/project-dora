import os
import json
import time

from google import genai
from google.genai import errors
from dotenv import load_dotenv
from utils.json_parser import parse_json
from prompts.planner_prompt import PLANNER_PROMPT

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def _generate_with_retry(prompt):
    models = [
        "models/gemini-3.6-flash",
        "models/gemini-3.5-flash",
        "models/gemini-flash-latest",
    ]

    last_exception = None
    for model_name in models:
        print(f"Trying model: {model_name}")
        for attempt in range(1, 4):
            print(f"Attempt {attempt}/3")
            try:
                return client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
            except errors.ServerError as exc:
                status_code = getattr(exc, "status_code", None)
                if status_code != 503:
                    raise
                last_exception = exc
                if attempt == 1:
                    print("503 received. Waiting 5 seconds...")
                    time.sleep(5)
                    continue
                if attempt == 2:
                    print("503 received. Waiting 10 seconds...")
                    time.sleep(10)
                    continue
                print("Switching to next model...")
            except errors.ClientError as exc:
                status_code = getattr(exc, "status_code", None)
                if status_code == 404:
                    print(f"Gemini 404 for retired model {model_name}; trying next model...")
                    last_exception = exc
                    break
                raise

    if last_exception is not None:
        raise last_exception
    raise RuntimeError("Gemini generation failed for all fallback models")


def generate_project_plan(discovery, research=None, tech_stack=None):
    prompt = f"""
{PLANNER_PROMPT}

Create a detailed implementation plan based on the following information.

Project Discovery:
{json.dumps(discovery, indent=2)}

Research:
{json.dumps(research, indent=2)}

Recommended Tech Stack:
{json.dumps(tech_stack, indent=2)}
"""

    response = _generate_with_retry(prompt)

    try:
        raw_text = response.text
    except Exception:
        raw_text = response.candidates[0].content.parts[0].text

    text = raw_text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    elif text.startswith("```"):
        text = text.replace("```", "").replace("```", "").strip()

    print("\n========== PLANNER RESPONSE ==========\n")
    print(text)
    print("\n======================================\n")

    return parse_json(raw_text)
