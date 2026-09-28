from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.orchestrator import generate_complete_project
from database.db import get_projects

from agent import (
    discover_projects,
    analyze_project,
    research_project,
    generate_project_plan,
    recommend_tech_stack,
    generate_synopsis,
)

from pdf_generator import generate_project_report
from fastapi.responses import FileResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://project-dora.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProjectRequest(BaseModel):
    topic: str

class AnalysisRequest(BaseModel):
    project: dict

class ResearchRequest(BaseModel):
    project: dict

class PlannerRequest(BaseModel):
    project: dict

class TechStackRequest(BaseModel):
    project: dict

class SynopsisRequest(BaseModel):
    project: dict
    research: dict | None = None
    tech_stack: dict | None = None
    planner: dict | None = None
    evaluation: dict | None = None

@app.post("/discover")
def discover(request: ProjectRequest):
    result = discover_projects(request.topic)
    return {
        "result": result
    }

@app.post("/analyze")
def analyze(request: AnalysisRequest):
    result = analyze_project(request.project)
    return result

@app.post("/research")
def research(request: ResearchRequest):
    result = research_project(request.project)
    return result

@app.post("/download-report")
def download_report(data: dict):

    filename = generate_project_report(
        data["project"],
        data["analysis"],
        data["research"]
    )

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename="Project_Dora_Report.pdf"
    )

@app.post("/planner")
def planner(request: PlannerRequest):

    result = generate_project_plan(request.project)

    return result

@app.post("/techstack")
def techstack(request: TechStackRequest):

    result = recommend_tech_stack(request.project)

    return result

@app.post("/synopsis")
def synopsis(request: SynopsisRequest):
    result = generate_synopsis(
        request.project,
        request.research or {"status": "Not generated"},
        request.tech_stack or {"status": "Not generated"},
        request.planner or {"status": "Not generated"},
        request.evaluation or {"status": "Not generated"},
    )

    return result

@app.post("/generate-project")
def generate_project(request: ProjectRequest):
    discovery = discover_projects(request.topic)
    return {
        "discovery": discovery,
        "research": None,
        "tech_stack": None,
        "planner": None,
        "synopsis": None,
        "evaluation": None,
    }

@app.get("/projects")
def all_projects():
    return get_projects()
