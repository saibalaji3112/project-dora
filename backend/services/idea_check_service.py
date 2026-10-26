"""Evidence-based search for existing public products and project repositories."""

import os
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from urllib.parse import urlparse

import requests


TIMEOUT_SECONDS = 12
MAX_RESULTS = 6


def _github_search(query):
    response = requests.get(
        "https://api.github.com/search/repositories",
        params={"q": query, "sort": "stars", "order": "desc", "per_page": MAX_RESULTS},
        headers={"Accept": "application/vnd.github+json"},
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    items = response.json().get("items", [])
    return [
        {
            "title": item.get("full_name") or item.get("name") or "Untitled repository",
            "description": item.get("description") or "No description provided.",
            "url": item.get("html_url"),
            "publisher": (item.get("owner") or {}).get("login"),
            "publisher_kind": "GitHub account",
            "date_label": "Repository created",
            "date": (item.get("created_at") or "")[:10] or None,
            "updated": (item.get("updated_at") or "")[:10] or None,
            "metrics": f"{item.get('stargazers_count', 0)} stars · {item.get('language') or 'Language not specified'}",
            "source": "GitHub",
        }
        for item in items
        if item.get("html_url")
    ]


def _web_search(query, api_key):
    response = requests.get(
        "https://api.search.brave.com/res/v1/web/search",
        params={"q": query, "count": MAX_RESULTS, "country": "IN", "search_lang": "en"},
        headers={"X-Subscription-Token": api_key, "Accept": "application/json"},
        timeout=TIMEOUT_SECONDS,
    )
    response.raise_for_status()
    results = (response.json().get("web") or {}).get("results", [])
    normalized = []
    for item in results:
        url = item.get("url")
        if not url:
            continue
        meta = item.get("meta_url") or {}
        normalized.append({
            "title": item.get("title") or "Untitled result",
            "description": item.get("description") or "No description provided.",
            "url": url,
            "publisher": meta.get("hostname") or urlparse(url).hostname,
            "publisher_kind": "Website",
            "date_label": "Page age",
            "date": item.get("page_age") or None,
            "updated": None,
            "metrics": None,
            "source": "Web",
        })
    return normalized


def _safe_source(search):
    try:
        return {"status": "available", "results": search(), "message": None}
    except requests.RequestException:
        return {"status": "unavailable", "results": [], "message": "Could not reach this search source."}
    except (ValueError, TypeError, KeyError, AttributeError):
        return {"status": "unavailable", "results": [], "message": "This search source returned an unreadable response."}


def check_existing_ideas(idea):
    idea = " ".join(idea.split())
    web_key = os.getenv("BRAVE_SEARCH_API_KEY", "").strip()
    search_text = " ".join(idea.split()[:50])[:450]
    web_query = f'"{search_text}" product platform app solution company'
    with ThreadPoolExecutor(max_workers=2) as executor:
        github_future = executor.submit(_safe_source, lambda: _github_search(search_text))
        if web_key:
            web_future = executor.submit(_safe_source, lambda: _web_search(web_query, web_key))
            web_result = web_future.result()
        else:
            web_result = {
                "status": "not_configured",
                "results": [],
                "message": "Add BRAVE_SEARCH_API_KEY to backend/.env to search products and company websites across the web.",
            }
        github_result = github_future.result()

    sources = {"web": web_result, "github": github_result}
    matches = [item for source in sources.values() for item in source["results"]]
    if web_result["status"] != "available" and github_result["status"] != "available":
        result_status = "unavailable"
    elif web_result["status"] != "available":
        result_status = "partial"
    elif matches:
        result_status = "matches_found"
    else:
        result_status = "no_results"

    summary = (
        "Potentially related projects or products were found. Compare their linked features and scope with your idea."
        if matches else
        "No matches surfaced from the available sources. This does not prove the idea is original."
    )
    return {
        "idea": idea,
        "status": result_status,
        "summary": summary,
        "sources": sources,
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "scope_note": "Search results are evidence to review, not proof of legal ownership or a patent/trademark clearance. A GitHub account or website is not necessarily the product owner. Dates are shown only when supplied by the source.",
    }
