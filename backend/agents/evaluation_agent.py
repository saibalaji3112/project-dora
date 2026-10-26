from agents.local_helpers import budget_text, development_weeks, primary_project, project_description, project_format, project_title


def generate_evaluation(discovery, research, tech_stack, planner, analysis=None):
    project = primary_project(discovery)
    fmt = project_format(project)
    weeks = development_weeks(project)
    feasibility = 7 if fmt == "software" else 6
    if weeks < 6:
        feasibility -= 1
    time_label = project.get("Estimated Development Time") or project.get("estimated_development_time") or f"{weeks} weeks"
    cost = str(planner.get("estimated_cost")) if isinstance(planner, dict) and planner.get("estimated_cost") else budget_text(None)
    description = project_description(project)
    return {
        "innovation_score": 6,
        "feasibility_score": feasibility,
        "complexity": "High" if fmt == "combined" else "Medium" if fmt == "hardware" else "Low to medium",
        "resume_value": 8,
        "interview_value": 7,
        "estimated_cost": cost,
        "estimated_development_time": str(time_label),
        "market_potential": "Potential is unverified; interview intended users and compare existing options before making adoption claims.",
        "risk_level": "Medium" if fmt == "software" else "High",
        "strengths": ["The scope can be divided into demonstrable milestones.", "The selected format supports a working prototype and measurable tests.", f"The concept has a defined starting point: {description[:140]}"],
        "weaknesses": ["User demand and differentiation have not been independently verified.", "Hardware or external-service costs may change after selection." if fmt != "software" else "Hosting and API usage may change after deployment.", "The first version may be too broad unless optional features are deferred."],
        "suggestions": ["Write acceptance tests before adding secondary features.", "Validate one key assumption with intended users or representative test data.", "Keep a contingency and record actual costs during implementation."],
    }
