from agents.local_helpers import development_weeks, primary_project, project_description, project_format, project_title, stack_items


def _as_list(value, fallback):
    if isinstance(value, list) and value:
        return [str(item) for item in value if item not in (None, "")]
    return fallback


def generate_synopsis(discovery, research=None, tech_stack=None, planner=None, evaluation=None, analysis=None):
    project = primary_project(discovery)
    title = project_title(project)
    description = project_description(project)
    fmt = project_format(project)
    weeks = development_weeks(project)
    stack = []
    if isinstance(tech_stack, dict):
        for key in ("frontend", "backend", "database", "ai_ml", "deployment", "programming_languages", "frameworks", "libraries", "development_tools"):
            value = tech_stack.get(key)
            if isinstance(value, list):
                stack.extend(str(item) for item in value)
            elif value and value != "Not required":
                stack.append(str(value))
    stack = list(dict.fromkeys(stack))[:8] or stack_items(project.get("Recommended Tech Stack"))[:5]
    modules = _as_list(project.get("Major Modules") or project.get("major_modules"), ["Requirements and configuration", "Core project workflow", "Validation and error handling", "Testing and reporting"])[:5]
    objective_prefix = "the prototype" if fmt != "software" else "the application"
    budget = str(planner.get("estimated_cost")) if isinstance(planner, dict) and planner.get("estimated_cost") else "Indicative estimate available in the project budget stage; verify local prices."
    timeline = str(project.get("Estimated Development Time") or project.get("estimated_development_time") or f"{weeks} weeks")
    feasibility = evaluation.get("feasibility_score") if isinstance(evaluation, dict) else None
    abstract = (f"{title} is a student project concept focused on this stated need: {description} The work will define a limited first version, implement its main workflow, and evaluate it with repeatable tests. It will use {', '.join(stack[:4]) if stack else 'a small, accessible technology stack'} and proceed through requirements, design, implementation, integration, and validation. The expected outcome is a reproducible prototype, documented setup, test results, and a clear account of limitations. Claims about novelty, demand, and performance must be confirmed through current sources and measured evaluation.")
    return {
        "title": title,
        "abstract": abstract,
        "problem_statement": f"The project begins from this stated need: {description} Target users, baseline alternatives, and measurable impact must be confirmed during research and requirements work.",
        "proposed_solution": f"Build a minimum viable {fmt} prototype for {title.lower()}. Implement the core workflow described as: {description} Validate it against agreed acceptance criteria before adding optional features.",
        "objectives": [f"Specify users, requirements, and acceptance criteria for {objective_prefix}.", "Design a buildable architecture within the available tools and budget.", "Implement and test the primary workflow with representative inputs.", "Evaluate results, document limitations, and prepare a reproducible demonstration."],
        "scope": f"The scope covers requirements, a working {fmt} prototype, integration checks where applicable, repeatable evaluation, and documentation. Production deployment and unvalidated secondary features are excluded.",
        "technology_stack": stack,
        "methodology": ["Define intended users, constraints, and measurable success criteria.", "Review current solutions and document evidence and assumptions.", "Design the smallest architecture and component set that meets the criteria.", "Implement the core workflow in short milestones and test each increment.", "Evaluate the prototype, record limitations, and prepare reproducible documentation."],
        "modules": modules,
        "expected_outcomes": ["A working prototype for the defined primary workflow.", "Documented acceptance tests, observations, and known limitations.", "A repeatable setup guide and academic project report."],
        "innovation": "The project’s contribution must be established by comparing its defined features and measured results with current work; no novelty claim is assumed here.",
        "feasibility": f"The project is planned for {timeline}. Evaluation stage feasibility score: {feasibility}/10." if feasibility is not None else f"The project is planned for {timeline}; feasibility depends on access to tools, time, and test participants.",
        "advantages": ["The first version is organized around a clear, testable workflow.", "Open-source and shared resources can reduce initial costs.", "Documented milestones make progress easier to review."],
        "future_scope": ["Expand features after successful validation of the first version.", "Test with a broader user group or representative dataset.", "Consider production deployment after security, reliability, and cost review."],
        "timeline": timeline,
        "estimated_budget": budget,
        "conclusion": f"{title} is suitable for a bounded student prototype if its assumptions are tested early, scope is maintained, and results are reported with limitations.",
    }
