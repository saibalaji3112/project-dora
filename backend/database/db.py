import json
import os

DB_FILE = os.path.join(os.path.dirname(__file__), "projects.json")


def save_project(project):
    try:
        with open(DB_FILE, "r") as f:
            data = json.load(f)
    except:
        data = []

    data.append(project)

    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)


def get_projects():
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except:
        return []