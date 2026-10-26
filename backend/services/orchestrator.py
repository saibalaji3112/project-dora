from database.db import save_project
from agents.analysis_agent import analyze_project
from agents.discovery_agent import discover_projects
from agents.research_agent import research_project
from agents.techstack_agent import recommend_tech_stack
from agents.budget_agent import estimate_project_budget
from agents.planner_agent import generate_project_plan
from agents.evaluation_agent import generate_evaluation
from agents.synopsis_agent import generate_synopsis


def generate_complete_project(topic: str):
    discovery = discover_projects(topic)
    project = discovery[0]
    analysis = analyze_project(project)
    research = research_project(project)
    tech_stack = recommend_tech_stack(project, research)
    budget_estimation = estimate_project_budget(project, analysis, tech_stack)
    planner = generate_project_plan(project, research, tech_stack, budget_estimation)
    evaluation = generate_evaluation(project, research, tech_stack, planner, analysis)
    synopsis = generate_synopsis(project, research, tech_stack, planner, evaluation, analysis)
    result = {
        "topic": topic,
        "discovery": discovery,
        "project": project,
        "analysis": analysis,
        "research": research,
        "tech_stack": tech_stack,
        "budget_estimation": budget_estimation,
        "planner": planner,
        "evaluation": evaluation,
        "synopsis": synopsis,
    }
    save_project(result)
    return result
