import os
import json
import time
from utils.json_parser import parse_json
from google import genai
from google.genai import errors, types
from dotenv import load_dotenv

from services.research_service import collect_research
from prompts.research_prompt import RESEARCH_PROMPT

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options=types.HttpOptions(
        timeout=45_000,
        retry_options=types.HttpRetryOptions(attempts=1),
    ),
)


def _generate_with_retry(prompt):
    models = ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.6-flash"]

    last_exception = None
    for model_name in models:
        print(f"Trying model: {model_name}")
        for attempt in range(1, 3):
            print(f"Attempt {attempt}/2")
            try:
                return client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
            except errors.ServerError as exc:
                status_code = getattr(exc, "code", getattr(exc, "status_code", None))
                if status_code not in (429, 503, 504):
                    raise
                last_exception = exc
                if status_code == 504:
                    print("Gemini request timed out; switching to next model...")
                    break
                if attempt == 1:
                    print(f"Gemini {status_code} received. Waiting 2 seconds...")
                    time.sleep(2)
                    continue
                print("Switching to next model...")
            except errors.ClientError as exc:
                status_code = getattr(exc, "code", getattr(exc, "status_code", None))
                if status_code == 404:
                    print(f"Gemini 404 for retired model {model_name}; trying next model...")
                    last_exception = exc
                    break
                raise

    if last_exception is not None:
        raise last_exception
    raise RuntimeError("Gemini generation failed for all fallback models")


def research_project(discovery):
    external_research = collect_research(discovery)

    prompt = f"""
{RESEARCH_PROMPT}

Use the following project discovery results as the context for your research.

Project Discovery:

{json.dumps(discovery, indent=2)}

External Research:
{json.dumps(external_research, indent=2)}
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

    return parse_json(raw_text)
