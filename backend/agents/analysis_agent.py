from agents.local_helpers import primary_project, project_description, project_format, project_title, stack_items


def analyze_project(project):
    project = primary_project(project)
    title = project_title(project)
    description = project_description(project)
    fmt = project_format(project)
    stack = stack_items(project.get("Recommended Tech Stack") or project.get("recommended_tech_stack"))[:4]
    hardware = (stack[:3] or ["Microcontroller board", "Project-specific sensors", "Power and wiring kit"]) if fmt in ("hardware", "combined") else []
    software = stack or (["Firmware development environment", "USB serial monitor"] if fmt == "hardware" else ["Embedded firmware toolchain", "Local API or dashboard, if required"])
    skills = list(dict.fromkeys(["Requirements definition", "Prototype implementation", "Testing and documentation", *stack[:2]]))[:5]
    return {
        "overview": f"{description} The first version should focus on one user group and a testable core workflow.",
        "innovation": "Demonstrate value through measurable reliability, usability, or cost improvements over a documented baseline.",
        "industry_demand": "Demand is unverified; validate the problem with interviews and compare existing solutions before expanding scope.",
        "real_world_applications": [f"A controlled pilot for users working in {title.lower()}.", "A campus or laboratory prototype with documented test conditions.", "A portfolio demonstration using representative test data."],
        "required_skills": skills,
        "software_requirements": software,
        "hardware_requirements": hardware,
        "development_steps": ["Define target users, constraints, and measurable acceptance criteria.", "Build the smallest working prototype for the primary workflow.", "Test representative inputs and record failures and measurements.", "Refine, document setup steps, and prepare a repeatable demonstration."],
        "challenges": ["Keep the first release within available time and budget.", "Verify reliability with repeatable tests rather than demonstration-only checks.", "Confirm component and service availability before finalizing the design."],
        "future_scope": ["Add features only after the core workflow passes acceptance tests.", "Evaluate usability and performance with a representative user group."],
        "resume_value": "A documented prototype with measurable tests demonstrates implementation, iteration, and engineering judgment.",
        "interview_questions": ["Which user problem does the first version solve, and how will you measure success?", "What is the main technical risk, and how will you test it early?", "Which feature did you exclude to keep the project buildable?"],
    }
