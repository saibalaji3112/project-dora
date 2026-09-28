import requests


def search_github_projects(topic: str):
    url = "https://api.github.com/search/repositories"

    params = {
        "q": topic,
        "sort": "stars",
        "order": "desc",
        "per_page": 5,
    }

    try:
        response = requests.get(url, params=params, timeout=10)
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

        return results

    except Exception as e:
        print(f"GitHub API Error: {e}")
        return []