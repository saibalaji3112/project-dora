"""
Research Service

This service is the single entry point for external research sources used by
Project DORA. Structured project details stay with the configured research
agent; public GitHub search only receives an explicit plain-text topic.
"""

from services.github_service import search_github_projects


def collect_research(topic):
    # The workflow passes a project object (and legacy workflows may pass a
    # list). Do not stringify or send those details to GitHub implicitly.
    github_projects = search_github_projects(topic) if isinstance(topic, str) else []
    return {
        "web_results": [],
        "research_papers": [],
        "github_projects": github_projects,
        "patents": [],
        "industry_trends": []
    }
