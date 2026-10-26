import logging
import os
import re
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, Field, field_validator
from database.auth_db import (
    add_search_history,
    authenticate_user,
    clear_search_history,
    create_session,
    create_user,
    delete_search_history_item,
    delete_saved_project,
    get_search_history,
    get_session_user,
    list_saved_projects,
    save_user_project,
    revoke_session,
    set_user_role,
)
from services.idea_check_service import check_existing_ideas

from agent import (
    discover_projects,
    analyze_project,
    research_project,
    generate_project_plan,
    recommend_tech_stack,
    generate_synopsis,
    estimate_project_budget,
)

from pdf_generator import generate_project_report
from fastapi.responses import FileResponse

load_dotenv(Path(__file__).resolve().parents[1] / ".env", override=False)

app = FastAPI()
logger = logging.getLogger(__name__)


@app.middleware("http")
async def require_signed_in_user(request: Request, call_next):
    public_paths = {"/health", "/auth/register", "/auth/login", "/docs", "/openapi.json", "/redoc"}
    if request.method == "OPTIONS" or request.url.path in public_paths:
        return await call_next(request)
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or get_session_user(token) is None:
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"detail": "Please sign in to continue."},
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await call_next(request)


configured_frontend_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys([
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "https://project-dora.vercel.app",
        *configured_frontend_origins,
    ])),
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):517[0-9]+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


class ProjectRequest(BaseModel):
    topic: str = Field(min_length=2, max_length=120)
    project_type: Literal["software", "hardware", "combined"] = "combined"

    @field_validator("topic")
    @classmethod
    def normalize_topic(cls, value):
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Enter at least two characters for the project domain.")
        return value


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value):
        value = value.strip()
        if len(value) < 2:
            raise ValueError("Name must contain at least two characters.")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        value = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Enter a valid email address.")
        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        value = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Enter a valid email address.")
        return value


class RoleRequest(BaseModel):
    role: Literal["student", "professor", "developer", "founder", "other"]


class SavedProjectRequest(BaseModel):
    project: dict
    outputs: dict = Field(default_factory=dict)


class IdeaCheckRequest(BaseModel):
    idea: str = Field(min_length=10, max_length=1000)

    @field_validator("idea")
    @classmethod
    def normalize_idea(cls, value):
        value = " ".join(value.split())
        if len(value) < 10:
            raise ValueError("Describe the idea in at least 10 characters.")
        return value


def _bearer_token(request: Request):
    scheme, _, token = request.headers.get("Authorization", "").partition(" ")
    return token if scheme.lower() == "bearer" else None


def _request_user(request: Request):
    user = get_session_user(_bearer_token(request))
    if user is None:
        raise HTTPException(status_code=401, detail="Please sign in to continue.")
    return user


@app.post("/auth/register", status_code=201)
def register(request: RegisterRequest):
    try:
        user = create_user(request.email, request.name, request.password)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return {"user": user, "access_token": create_session(user["id"]), "token_type": "bearer"}


@app.post("/auth/login")
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return {"user": user, "access_token": create_session(user["id"]), "token_type": "bearer"}


@app.get("/auth/me")
def auth_me(request: Request):
    return {"user": _request_user(request)}


@app.put("/auth/role")
def update_role(request: RoleRequest, auth_request: Request):
    user = _request_user(auth_request)
    return {"user": set_user_role(user["id"], request.role)}


@app.post("/auth/logout")
def logout(request: Request):
    revoke_session(_bearer_token(request))
    return {"message": "Signed out."}


@app.get("/search-history")
def search_history(request: Request):
    user = _request_user(request)
    return get_search_history(user["id"])


@app.delete("/search-history")
def remove_all_search_history(request: Request):
    user = _request_user(request)
    clear_search_history(user["id"])
    return {"message": "Search history cleared."}


@app.get("/saved-projects")
def saved_projects(request: Request):
    user = _request_user(request)
    return list_saved_projects(user["id"])


@app.post("/saved-projects", status_code=201)
def create_saved_project(payload: SavedProjectRequest, request: Request):
    user = _request_user(request)
    try:
        saved = save_user_project(user["id"], payload.project, payload.outputs)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"project": saved}


@app.put("/saved-projects/{project_id}")
def update_saved_project(project_id: str, payload: SavedProjectRequest, request: Request):
    user = _request_user(request)
    try:
        saved = save_user_project(user["id"], payload.project, payload.outputs, project_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    if saved is None:
        raise HTTPException(status_code=404, detail="Saved project not found.")
    return {"project": saved}


@app.delete("/saved-projects/{project_id}")
def remove_saved_project(project_id: str, request: Request):
    user = _request_user(request)
    if not delete_saved_project(user["id"], project_id):
        raise HTTPException(status_code=404, detail="Saved project not found.")
    return {"message": "Project removed from your library."}


@app.delete("/search-history/{history_id}")
def remove_search_history_item(history_id: int, request: Request):
    user = _request_user(request)
    delete_search_history_item(user["id"], history_id)
    return {"message": "Search removed."}

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
    analysis: dict | None = None

class WorkflowRequest(BaseModel):
    stage: str
    project: dict
    analysis: dict | None = None
    research: dict | None = None
    tech_stack: dict | None = None
    budget_estimation: dict | None = None
    planner: dict | None = None
    evaluation: dict | None = None

WORKFLOW_STAGES = ("analysis", "research", "tech_stack", "budget_estimation", "planner", "evaluation", "synopsis")

def _has_content(value):
    return isinstance(value, (dict, list)) and bool(value)


def _run_workflow_stage(request: WorkflowRequest):
    stage = request.stage
    if stage not in WORKFLOW_STAGES:
        raise HTTPException(status_code=400, detail="Unknown workflow stage.")

    prerequisites = {
        "analysis": (),
        "research": ("analysis",),
        "tech_stack": ("analysis", "research"),
        "budget_estimation": ("analysis", "research", "tech_stack"),
        "planner": ("analysis", "research", "tech_stack"),
        "evaluation": ("analysis", "research", "tech_stack", "planner"),
        "synopsis": ("analysis", "research", "tech_stack", "planner", "evaluation"),
    }
    prerequisites["planner"] = ("analysis", "research", "tech_stack", "budget_estimation")
    supplied = request.model_dump()
    missing = [name for name in prerequisites[stage] if not _has_content(supplied.get(name))]
    if missing:
        raise HTTPException(status_code=409, detail=f"Complete these stages first: {', '.join(missing)}.")

    if stage == "analysis":
        result = analyze_project(request.project)
    elif stage == "research":
        result = research_project(request.project)
    elif stage == "tech_stack":
        result = recommend_tech_stack(request.project, request.research)
    elif stage == "budget_estimation":
        result = estimate_project_budget(request.project, request.analysis, request.tech_stack)
    elif stage == "planner":
        result = generate_project_plan(request.project, request.research, request.tech_stack, request.budget_estimation)
    elif stage == "evaluation":
        from agents.evaluation_agent import generate_evaluation
        result = generate_evaluation(request.project, request.research, request.tech_stack, request.planner, request.analysis)
    else:
        result = generate_synopsis(request.project, request.research, request.tech_stack, request.planner, request.evaluation, request.analysis)
    return {"stage": stage, "result": result}


@app.post("/next-agent")
def next_agent(request: WorkflowRequest):
    try:
        return _run_workflow_stage(request)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Agent stage %s failed", request.stage)
        raise HTTPException(status_code=502, detail=f"The {request.stage} agent failed ({type(exc).__name__}). Check the backend terminal for details.") from exc

@app.post("/discover")
def discover(request: ProjectRequest, auth_request: Request):
    user = _request_user(auth_request)
    result = discover_projects(request.topic, user.get("role"), request.project_type)
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
    required = ["analysis", "research", "tech_stack", "budget_estimation", "planner", "evaluation", "synopsis"]
    if any(not _has_content(data.get(key)) for key in required):
        raise HTTPException(status_code=409, detail="Complete all seven required agent stages before downloading the full report.")
    filename = generate_project_report(data)

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename="Project_Dora_Report.pdf"
    )

@app.post("/download-synopsis")
def download_synopsis(data: dict):
    if not _has_content(data.get("synopsis")):
        raise HTTPException(status_code=409, detail="Generate the synopsis before downloading it.")
    filename = generate_project_report(data, synopsis_only=True)
    return FileResponse(filename, media_type="application/pdf", filename="Project_Dora_Synopsis.pdf")

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
    inputs = {
        "analysis": request.analysis,
        "research": request.research,
        "tech_stack": request.tech_stack,
        "planner": request.planner,
        "evaluation": request.evaluation,
    }
    missing = [name for name, value in inputs.items() if not _has_content(value)]
    if missing:
        raise HTTPException(status_code=409, detail=f"Complete these stages first: {', '.join(missing)}.")
    result = generate_synopsis(
        request.project,
        request.research,
        request.tech_stack,
        request.planner,
        request.evaluation,
        request.analysis,
    )

    return result

@app.post("/generate-project")
def generate_project(request: ProjectRequest, auth_request: Request):
    user = _request_user(auth_request)
    discovery = discover_projects(request.topic, user.get("role"), request.project_type)

    add_search_history(user["id"], request.topic)

    return {
        "discovery": discovery,
        "research": None,
        "tech_stack": None,
        "planner": None,
        "synopsis": None,
        "evaluation": None
    }


@app.post("/check-idea")
def check_idea(request: IdeaCheckRequest, auth_request: Request):
    user = _request_user(auth_request)
    try:
        result = check_existing_ideas(request.idea)
    except Exception as exc:
        logger.exception("Existing-idea search failed for user %s", user["id"])
        raise HTTPException(status_code=502, detail="Idea search could not be completed. Please try again.") from exc
    return result

@app.get("/projects")
def all_projects(request: Request):
    # Keep the legacy URL scoped to the signed-in account; never expose the old shared JSON store.
    return list_saved_projects(_request_user(request)["id"])
