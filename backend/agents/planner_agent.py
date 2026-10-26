from agents.local_helpers import budget_text, development_weeks, primary_project, project_description, project_format, project_title, stack_items


def generate_project_plan(discovery, research=None, tech_stack=None, budget_estimation=None):
    project = primary_project(discovery)
    fmt = project_format(project)
    weeks = development_weeks(project)
    stack = stack_items(tech_stack)
    description = project_description(project)
    phases = ["Confirm users, constraints, and measurable acceptance criteria.", "Finalize architecture, component list, data flow, and test plan.", "Set up the repository and implement the smallest core workflow.", "Complete the main software modules or device-side functions.", "Integrate components and test normal and failure conditions.", "Fix priority defects and measure the acceptance criteria.", "Run a small user review and refine confusing interactions.", "Finalize documentation, reproducible setup, and demonstration.", "Repeat integration tests and close priority defects.", "Prepare final report, presentation, and handover checklist.", "Rehearse the demonstration on a clean setup.", "Complete final review and archive source, tests, and results."]
    weekly_plan = [{"week": week, "deliverable": phases[min(week - 1, len(phases) - 1)]} for week in range(1, weeks + 1)]
    if fmt == "hardware":
        architecture = f"A standalone physical prototype: sensors and controller perform the core function, with outputs verified through repeatable bench tests. Scope: {description}"
        database = "No database is needed for the first prototype; store configuration locally only if required."
        apis, hardware = [], stack[:4] or ["Microcontroller board", "Required sensors", "Power and wiring", "Mounting materials"]
        software = stack[:4] or ["Firmware IDE", "Serial monitor", "Git"]
        folder = "firmware/ · hardware/ · tests/ · docs/"
    else:
        architecture = f"A small application with a user interface, one API service, and a simple data store. Build the core workflow for: {description}"
        database = "Use SQLite for a single-project prototype; define only records needed by the core workflow."
        apis = ["POST /api/items — validate and create the primary project record.", "GET /api/items — list saved records for the signed-in user.", "PATCH /api/items/{id} — update status or editable fields."]
        hardware = stack[:3] if fmt == "combined" else []
        software = stack[:4] or ["Frontend framework", "Python API", "SQLite", "Git"]
        folder = "frontend/ · backend/ · database/ · tests/ · docs/"
    budget = budget_text(budget_estimation)
    milestones = [{"milestone": "Scope agreed", "acceptance": "User, main workflow, exclusions, and success measures documented."}, {"milestone": "Core prototype", "acceptance": "One end-to-end happy path works on the target setup."}, {"milestone": "Validated build", "acceptance": "Acceptance tests and priority failure cases pass."}, {"milestone": "Final handoff", "acceptance": "Setup guide, report, source, and demo are reproducible."}]
    return {"system_architecture": architecture, "folder_structure": folder, "database_design": database, "apis_required": apis, "weekly_plan": weekly_plan, "milestones": milestones, "estimated_cost": budget, "software_requirements": software, "hardware_requirements": hardware}
