import requests
import time

_search_cache = {}
_CACHE_TTL_SECONDS = 300


def search_github_projects(topic: str):
    # Fail closed when callers pass a structured project or other object.
    if not isinstance(topic, str) or not topic.strip():
        return []

    cache_key = " ".join(topic.lower().split())
    cached = _search_cache.get(cache_key)
    now = time.monotonic()
    if cached and now - cached[0] < _CACHE_TTL_SECONDS:
        return cached[1]

    url = "https://api.github.com/search/repositories"
    params = {
        "q": topic,
        "sort": "stars",
        "order": "desc",
        "per_page": 5,
    }

    try:
        response = requests.get(url, params=params, timeout=3.5)
        response.raise_for_status()
        repositories = response.json().get("items", [])
        results = []

        for repo in repositories:
            results.append({
                "name": repo["name"],
                "description": repo["description"] or "No description",
                "url": repo["html_url"],
                "stars": repo["stargazers_count"],
                "language": repo["language"] or "Unknown",
                "owner": repo["owner"]["login"],
            })

        _search_cache[cache_key] = (now, results)
        return results
    except Exception as e:
        print(f"GitHub API Error: {e}")
        return []
