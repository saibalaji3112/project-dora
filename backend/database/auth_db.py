"""SQLite accounts, hashed-password authentication, sessions and user search history."""

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import time
import uuid
from contextlib import contextmanager
from pathlib import Path


DB_FILE = Path(os.getenv("DORA_AUTH_DB", Path(__file__).with_name("dora_auth.sqlite3")))
PASSWORD_ITERATIONS = 310_000
SESSION_LIFETIME_SECONDS = 7 * 24 * 60 * 60
DUMMY_SALT = bytes(16)


@contextmanager
def _connect():
    connection = sqlite3.connect(DB_FILE, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def _ensure_schema(connection):
    connection.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE COLLATE NOCASE,
            display_name TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            role TEXT CHECK (role IS NULL OR role IN ('student', 'professor', 'developer', 'founder', 'other'))
        );
        CREATE TABLE IF NOT EXISTS sessions (
            token_hash TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at);
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            query TEXT NOT NULL COLLATE NOCASE,
            searched_at INTEGER NOT NULL,
            UNIQUE(user_id, query)
        );
        CREATE INDEX IF NOT EXISTS search_history_recent_idx ON search_history(user_id, searched_at DESC);
        CREATE TABLE IF NOT EXISTS saved_projects (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            project_json TEXT NOT NULL,
            outputs_json TEXT NOT NULL DEFAULT '{}',
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE INDEX IF NOT EXISTS saved_projects_user_recent_idx ON saved_projects(user_id, updated_at DESC);
    """)
    user_columns = {row["name"] for row in connection.execute("PRAGMA table_info(users)")}
    if "role" not in user_columns:
        connection.execute("ALTER TABLE users ADD COLUMN role TEXT")


def _password_hash(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS).hex()


_DUMMY_HASH = _password_hash("not-a-real-password", DUMMY_SALT)


def _public_user(row):
    return None if row is None else {
        "id": row["id"], "email": row["email"], "name": row["display_name"],
        "role": row["role"] if "role" in row.keys() else None,
    }


def set_user_role(user_id, role):
    allowed_roles = {"student", "professor", "developer", "founder", "other"}
    if role not in allowed_roles:
        raise ValueError("Choose a valid account role.")
    with _connect() as connection:
        _ensure_schema(connection)
        connection.execute("UPDATE users SET role = ? WHERE id = ?", (role, user_id))
        row = connection.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _public_user(row)


def create_user(email, name, password):
    salt = secrets.token_bytes(16)
    now = int(time.time())
    with _connect() as connection:
        _ensure_schema(connection)
        try:
            cursor = connection.execute(
                "INSERT INTO users(email, display_name, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
                (email.strip().lower(), name.strip(), salt.hex(), _password_hash(password, salt), now),
            )
        except sqlite3.IntegrityError as exc:
            raise ValueError("An account with this email already exists.") from exc
        return _public_user(connection.execute("SELECT * FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone())


def authenticate_user(email, password):
    with _connect() as connection:
        _ensure_schema(connection)
        row = connection.execute("SELECT * FROM users WHERE email = ?", (email.strip().lower(),)).fetchone()
    salt = bytes.fromhex(row["password_salt"]) if row else DUMMY_SALT
    expected = row["password_hash"] if row else _DUMMY_HASH
    actual = _password_hash(password, salt)
    return _public_user(row) if row and hmac.compare_digest(actual, expected) else None


def create_session(user_id):
    token = secrets.token_urlsafe(32)
    now = int(time.time())
    with _connect() as connection:
        _ensure_schema(connection)
        connection.execute("DELETE FROM sessions WHERE expires_at <= ?", (now,))
        connection.execute("INSERT INTO sessions VALUES (?, ?, ?, ?)", (hashlib.sha256(token.encode()).hexdigest(), user_id, now + SESSION_LIFETIME_SECONDS, now))
    return token


def get_session_user(token):
    if not token:
        return None
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    now = int(time.time())
    with _connect() as connection:
        _ensure_schema(connection)
        row = connection.execute(
            "SELECT users.* FROM users JOIN sessions ON sessions.user_id = users.id WHERE sessions.token_hash = ? AND sessions.expires_at > ?",
            (token_hash, now),
        ).fetchone()
    return _public_user(row)


def revoke_session(token):
    if not token:
        return
    with _connect() as connection:
        _ensure_schema(connection)
        connection.execute("DELETE FROM sessions WHERE token_hash = ?", (hashlib.sha256(token.encode()).hexdigest(),))


def add_search_history(user_id, query):
    query = " ".join(query.split())[:1000]
    now = int(time.time())
    with _connect() as connection:
        _ensure_schema(connection)
        connection.execute("DELETE FROM search_history WHERE user_id = ? AND query = ? COLLATE NOCASE", (user_id, query))
        connection.execute("INSERT INTO search_history(user_id, query, searched_at) VALUES (?, ?, ?)", (user_id, query, now))
        connection.execute(
            "DELETE FROM search_history WHERE user_id = ? AND id NOT IN (SELECT id FROM search_history WHERE user_id = ? ORDER BY searched_at DESC, id DESC LIMIT 10)",
            (user_id, user_id),
        )


def get_search_history(user_id):
    with _connect() as connection:
        _ensure_schema(connection)
        rows = connection.execute("SELECT id, query, searched_at FROM search_history WHERE user_id = ? ORDER BY searched_at DESC, id DESC LIMIT 10", (user_id,)).fetchall()
    return [{"id": row["id"], "query": row["query"], "searched_at": row["searched_at"]} for row in rows]


def delete_search_history_item(user_id, history_id):
    with _connect() as connection:
        _ensure_schema(connection)
        connection.execute("DELETE FROM search_history WHERE id = ? AND user_id = ?", (history_id, user_id))


def clear_search_history(user_id):
    with _connect() as connection:
        _ensure_schema(connection)
        connection.execute("DELETE FROM search_history WHERE user_id = ?", (user_id,))


def _saved_project(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "project": json.loads(row["project_json"]),
        "outputs": json.loads(row["outputs_json"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def _encode_project_data(project, outputs):
    if not isinstance(project, dict) or not project:
        raise ValueError("A project with a title and description is required.")
    if not isinstance(outputs, dict):
        raise ValueError("Project workflow outputs must be an object.")
    try:
        project_json = json.dumps(project, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
        outputs_json = json.dumps(outputs, ensure_ascii=False, allow_nan=False, separators=(",", ":"))
    except (TypeError, ValueError) as exc:
        raise ValueError("Project details contain data that cannot be saved.") from exc
    if len(project_json) + len(outputs_json) > 500_000:
        raise ValueError("This project is too large to save. Remove large embedded data and retry.")
    return project_json, outputs_json


def list_saved_projects(user_id):
    with _connect() as connection:
        _ensure_schema(connection)
        rows = connection.execute(
            "SELECT * FROM saved_projects WHERE user_id = ? ORDER BY updated_at DESC, created_at DESC",
            (user_id,),
        ).fetchall()
    return [_saved_project(row) for row in rows]


def save_user_project(user_id, project, outputs, project_id=None):
    project_json, outputs_json = _encode_project_data(project, outputs)
    now = int(time.time())
    with _connect() as connection:
        _ensure_schema(connection)
        if project_id:
            cursor = connection.execute(
                "UPDATE saved_projects SET project_json = ?, outputs_json = ?, updated_at = ? WHERE id = ? AND user_id = ?",
                (project_json, outputs_json, now, project_id, user_id),
            )
            if cursor.rowcount == 0:
                return None
            row = connection.execute("SELECT * FROM saved_projects WHERE id = ? AND user_id = ?", (project_id, user_id)).fetchone()
        else:
            def normalized(value):
                return " ".join(str(value or "").split()).casefold()

            title = normalized(project.get("Project Title") or project.get("title"))
            description = normalized(project.get("Short Description") or project.get("description"))
            if title and description:
                existing_rows = connection.execute(
                    "SELECT * FROM saved_projects WHERE user_id = ? ORDER BY updated_at DESC",
                    (user_id,),
                ).fetchall()
                for existing in existing_rows:
                    existing_project = json.loads(existing["project_json"])
                    existing_title = normalized(existing_project.get("Project Title") or existing_project.get("title"))
                    existing_description = normalized(existing_project.get("Short Description") or existing_project.get("description"))
                    if title == existing_title and description == existing_description:
                        return _saved_project(existing)
            project_id = uuid.uuid4().hex
            connection.execute(
                "INSERT INTO saved_projects(id, user_id, project_json, outputs_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                (project_id, user_id, project_json, outputs_json, now, now),
            )
            row = connection.execute("SELECT * FROM saved_projects WHERE id = ? AND user_id = ?", (project_id, user_id)).fetchone()
    return _saved_project(row)


def delete_saved_project(user_id, project_id):
    with _connect() as connection:
        _ensure_schema(connection)
        cursor = connection.execute("DELETE FROM saved_projects WHERE id = ? AND user_id = ?", (project_id, user_id))
    return cursor.rowcount > 0
