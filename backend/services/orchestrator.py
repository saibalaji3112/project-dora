from database.db import save_project
from agents.discovery_agent import discover_projects
from agents.research_agent import research_project
from agents.techstack_agent import recommend_tech_stack
from agents.planner_agent import generate_project_plan
from agents.synopsis_agent import generate_synopsis
from agents.evaluation_agent import generate_evaluation

def generate_complete_project(topic: str):

    # Agent 1
    discovery = discover_projects(topic)

    # Agent 2
    research = research_project(discovery)

    # Agent 3
    tech_stack = recommend_tech_stack(
        discovery,
        research,
    )

    # Agent 4
    planner = generate_project_plan(
        discovery,
        research,
        tech_stack,
    )

    evaluation = generate_evaluation(
        discovery,
        research,
        tech_stack,
        planner,
    )

    # Agent 5
    synopsis = generate_synopsis(
        discovery,
        research,
        tech_stack,
        planner,
        evaluation
    )
    
    save_project({
    "topic": topic,
    "discovery": discovery,
    "research": research,
    "tech_stack": tech_stack,
    "planner": planner,
    "synopsis": synopsis,
    "evaluation": evaluation,
    })
    
    return {
        "discovery": discovery,
        "research": research,
        "tech_stack": tech_stack,
        "planner": planner,
        "synopsis": synopsis,
        "evaluation": evaluation,
    }