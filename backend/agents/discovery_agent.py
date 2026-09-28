import os
import time

from google import genai
from google.genai import types
from google.genai import errors
from dotenv import load_dotenv

from prompts.discovery_prompt import DISCOVERY_PROMPT
from utils.json_parser import parse_json

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY"),
    http_options=types.HttpOptions(
        timeout=45_000,
        # The Discovery Agent manages its own short fallback sequence below.
        retry_options=types.HttpRetryOptions(attempts=1),
    ),
)

GENERATION_MODELS = (
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
)


def _generate_with_retry(prompt):
    last_exception = None
    for model_name in GENERATION_MODELS:
        print(f"Trying model: {model_name}")
        for attempt in range(1, 3):
            print(f"Attempt {attempt}/2")
            try:
                return client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
            except (errors.ServerError, errors.ClientError) as exc:
                # google-genai exposes this as ``code`` (not ``status_code``).
                status_code = getattr(exc, "code", getattr(exc, "status_code", None))
                if status_code not in (429, 503, 504):
                    if status_code == 404:
                        print(f"Gemini 404 for unavailable model {model_name}; trying next model...")
                        last_exception = exc
                        break
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

    if last_exception is not None:
        raise last_exception
    raise RuntimeError("Gemini generation failed for all fallback models")


def discover_projects(topic):
    prompt = f"""
{DISCOVERY_PROMPT}

Domain:
{topic}
"""

    print("\n========== DISCOVERY AGENT ==========")
    print(f"Topic: {topic}")
    print(f"Prompt Length: {len(prompt)} characters")

    start = time.perf_counter()

    response = _generate_with_retry(prompt)
    print(response.candidates[0].finish_reason)
    end = time.perf_counter()

    print(f"Discovery Time: {end - start:.2f} seconds")

    try:
        raw_text = response.text
    except Exception:
        raw_text = response.candidates[0].content.parts[0].text

    print("\n========== RAW DISCOVERY RESPONSE ==========\n")
    print(raw_text)
    print("\n============================================\n")

    projects = parse_json(raw_text)
    return [
        {
            "Project Title": project.get("Project Title", project.get("project_title", "Untitled Project")),
            "Short Description": project.get("Short Description", project.get("short_description", "")),
            "Difficulty": project.get("Difficulty", project.get("difficulty", "")),
            "Innovation Score": project.get("Innovation Score", project.get("innovation_score", "")),
            "Resume Value": project.get("Resume Value", project.get("resume_value", "")),
            "Interview Value": project.get("Interview Value", project.get("interview_value", "")),
            "Estimated Development Time": project.get("Estimated Development Time", project.get("estimated_development_time", "")),
            "Recommended Tech Stack": project.get("Recommended Tech Stack", project.get("recommended_tech_stack", "")),
            "Major Modules": project.get("Major Modules", project.get("major_modules", [])),
        }
        for project in projects
    ]
