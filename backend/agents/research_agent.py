import re

from agents.local_helpers import primary_project, project_description, project_format, project_title, stack_items
from services.research_service import collect_research


def _keywords(project):
    text = f"{project_title(project)} {project_description(project)}"
    stop = {"with", "from", "using", "that", "this", "into", "project", "system", "based", "the", "and", "for", "its", "which", "will", "their"}
    words = re.findall(r"[A-Za-z][A-Za-z0-9+#.-]{2,}", text)
    found, seen = [], set()
    for word in words:
        key = word.casefold()
        if key not in stop and key not in seen:
            seen.add(key)
            found.append(word)
    return found[:5] or ["prototype", "requirements", "evaluation"]


def research_project(discovery):
    project = primary_project(discovery)
    title = project_title(project)
    description = project_description(project)
    fmt = project_format(project)
    stack = stack_items(project.get("Recommended Tech Stack") or project.get("recommended_tech_stack"))
    duration = project.get("Estimated Development Time") or project.get("estimated_development_time") or "8 weeks"
    sources = collect_research(project)
    return {
        "research_keywords": _keywords(project),
        "literature_summary": "This is a research starting brief, not a literature review. No papers or current web sources were searched; specific findings and citations remain to be verified.",
        "research_gap": f"Test whether {description.rstrip('.')} performs reliably for intended users under documented conditions; this is a hypothesis to validate, not a verified literature gap.",
        "novelty_score": "Not independently verified; compare the exact features with current products and papers before making novelty claims.",
        "recent_trends": [],
        "future_research_directions": ["Compare the prototype with a documented baseline using the same test cases.", "Measure reliability, usability, and cost with representative users or test data."],
        "publication_potential": "Potential depends on a defined contribution, reproducible evaluation, and literature review; this brief does not establish publishability.",
        "recommended_datasets": [],
        "recommended_tools": stack[:3],
        "possible_research_titles": [f"Design and Evaluation of {title}", f"A Practical Prototype for {title}: Scope and Validation"],
        "implementation_difficulty": f"{'High' if fmt == 'combined' else 'Medium'} — depends on integration and component selection.",
        "estimated_completion_time": str(duration),
        "external_research": {"web_results": sources.get("web_results", []), "research_papers": sources.get("research_papers", []), "github_projects": sources.get("github_projects", []), "patents": sources.get("patents", []), "industry_trends": sources.get("industry_trends", []), "status": "No external sources were queried for this project-specific brief."},
    }
