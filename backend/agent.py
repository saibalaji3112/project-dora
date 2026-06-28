import os
import json
import google.generativeai as genai

from dotenv import load_dotenv
from prompt import (
    PROJECT_DISCOVERY_PROMPT,
    PROJECT_ANALYSIS_PROMPT,
    PROJECT_RESEARCH_PROMPT,
    PROJECT_PLANNER_PROMPT,
    PROJECT_TECHSTACK_PROMPT,
    PROJECT_SYNOPSIS_PROMPT,
)

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("models/gemini-2.5-flash")


def discover_projects(topic):

    prompt = f"""
{PROJECT_DISCOVERY_PROMPT}

Domain:
{topic}
"""

    response = model.generate_content(prompt)

    try:
        text = response.text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        return json.loads(text)

    except Exception:
        import json

        return json.loads(response.text)

def analyze_project(project):

    prompt = f"""
{PROJECT_ANALYSIS_PROMPT}

Project Details:

{project}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    elif text.startswith("```"):
        text = text.replace("```", "").replace("```", "").strip()

    return json.loads(text)

def research_project(project):

    prompt = f"""
{PROJECT_RESEARCH_PROMPT}

Project Details:

{project}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    elif text.startswith("```"):
        text = text.replace("```", "").replace("```", "").strip()

    return json.loads(text)

def generate_project_plan(project):

    prompt = f"""
{PROJECT_PLANNER_PROMPT}

Project Details:

{project}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    elif text.startswith("```"):
        text = text.replace("```", "").replace("```", "").strip()

    return json.loads(text)

def recommend_tech_stack(project):

    prompt = f"""
{PROJECT_TECHSTACK_PROMPT}

Project Details:

{project}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    elif text.startswith("```"):
        text = text.replace("```", "").replace("```", "").strip()

    return json.loads(text)

def generate_synopsis(project):

    prompt = f"""
{PROJECT_SYNOPSIS_PROMPT}

Project Details:

{project}
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()
    elif text.startswith("```"):
        text = text.replace("```", "").replace("```", "").strip()

    return json.loads(text)