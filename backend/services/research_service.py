"""
Research Service

This service will become the single entry point for all external research
sources used by Project DORA.

Currently it returns placeholder data.
Later we will connect:
- Web Search
- arXiv
- GitHub
- Patent APIs
"""

from services.github_service import search_github_projects


def collect_research(topic: str):
    return {
        "web_results": [],
        "research_papers": [],
        "github_projects": search_github_projects(topic),
        "patents": [],
        "industry_trends": []
    }