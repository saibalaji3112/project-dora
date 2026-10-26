import re


def primary_project(value):
    if isinstance(value, dict):
        return value
    if isinstance(value, list):
        return next((item for item in value if isinstance(item, dict)), {})
    return {"Project Title": str(value or "Student project")}


def field(project, *names, default=""):
    project = primary_project(project)
    for name in names:
        value = project.get(name)
        if value not in (None, "", [], {}):
            return value
    return default


def project_title(project):
    return str(field(project, "Project Title", "project_title", "title", "name", default="Student project")).strip()


def project_description(project):
    return str(field(project, "Short Description", "short_description", "description", "overview", default="A practical student project concept.")).strip()


def project_format(project):
    raw = str(field(project, "Project Format", "project_type", "project_format", default="software")).lower()
    if "combined" in raw or ("hardware" in raw and "software" in raw):
        return "combined"
    return "hardware" if "hardware" in raw else "software"


def stack_items(value):
    if isinstance(value, dict):
        candidates = []
        for key in ("Recommended Tech Stack", "recommended_tech_stack", "tech_stack", "programming_languages", "frameworks", "libraries", "development_tools"):
            if value.get(key):
                candidates.extend(stack_items(value[key]))
        return _unique(candidates)
    if isinstance(value, (list, tuple, set)):
        return _unique([str(item).strip() for item in value if str(item).strip()])
    if not value:
        return []
    return _unique([part.strip() for part in re.split(r"[,;|\n]", str(value)) if part.strip()])


def _unique(values):
    output = []
    seen = set()
    for value in values:
        value = str(value).strip()
        key = value.casefold()
        if value and key not in seen:
            seen.add(key)
            output.append(value)
    return output


def development_weeks(project, default=8):
    value = str(field(project, "Estimated Development Time", "estimated_development_time", "timeline", default=""))
    match = re.search(r"(\d+)\s*(week|month)", value.lower())
    if not match:
        return default
    count = int(match.group(1))
    weeks = count * 4 if match.group(2) == "month" else count
    return max(4, min(16, weeks))


def budget_text(budget):
    if not isinstance(budget, dict):
        return "Indicative budget to be confirmed during component selection."
    total = budget.get("total_estimate") or {}
    low, high = total.get("low"), total.get("high")
    if isinstance(low, (int, float)) and isinstance(high, (int, float)):
        return f"INR {low:,.0f}–{high:,.0f}, including the stated contingency; planning estimate."
    return str(budget.get("estimate_note") or "Indicative planning estimate; confirm local prices.")
