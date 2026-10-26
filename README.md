# Project Dora

Project Dora helps users explore project concepts and turn one selected idea into a practical seven-stage plan: analysis, research brief, technology stack, budget estimate, development plan, evaluation, and synopsis. These stages use local structured generators, so normal discovery and project planning do not need a model API key, wait for a remote model, or fail on truncated JSON.

## Requirements

- Python 3.10 or newer
- Node.js 20 or newer and npm

## Run locally (Windows PowerShell)

1. Create `backend/.env` from `backend/.env.example`. No AI-provider key is required. Add `BRAVE_SEARCH_API_KEY` only if you want broader web results in the existing-idea checker.
2. In a PowerShell window:

   ```powershell
   cd backend
   py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install -r requirements.txt
   python -m uvicorn services.main:app --reload
   ```

3. In a second PowerShell window:

   ```powershell
   cd frontend
   Copy-Item .env.example .env
   npm install
   npm run dev
   ```

4. Open the local address printed by Vite (normally `http://localhost:5173`).

The frontend calls `http://127.0.0.1:8000` by default. Set `VITE_API_URL` in `frontend/.env` if the backend runs elsewhere. Project ideas and workflow outputs are generated locally from the topic, selected format, role, and completed project stages. The research brief clearly marks unverified claims and does not invent citations or research findings.

## Accounts and idea checking

- Create an account or sign in from the app. Passwords are stored as salted hashes, and each account has its own expiring sign-in session, recent discovery history, and saved project library.
- Open **My projects** to save ideas, resume a seven-stage plan, search or filter saved work, and remove items. Use **Account and preferences** to update your project perspective and motion preference.
- Use **Check what already exists** to search for related products and open-source projects. GitHub repository search is available without a key. Add `BRAVE_SEARCH_API_KEY` to `backend/.env` for broader web results; without it, the checker reports a partial search.
- Search results are evidence to review, not proof of originality, ownership, or patent clearance. Restart the backend after changing `.env`.

## Review checks

From `frontend/`, run:

```powershell
npm run lint
npm run build
```

From `backend/`, run:

```powershell
python -m compileall -q agent.py agents services database prompts utils pdf_generator.py
```

To review the API schema, open `http://127.0.0.1:8000/docs` while the backend is running. The full report endpoint rejects incomplete workflows; the synopsis has its own download endpoint.

## Workflow and downloads

Choose an idea and use **Run next agent** to advance one stage at a time. Each stage is local and returns immediately without an AI-provider request. A failed stage can be retried without losing completed results. The budget stage provides indicative planning ranges for hosting, domains, printing, licenses, and hardware components; verify supplier prices before purchasing. Patent or IP professional costs require a current quote and are excluded from the estimate. The synopsis PDF appears after the synopsis stage. The complete PDF report appears after all seven stages finish.

## Deploy a free demo

The deployment files are ready for the existing GitHub repository:

- **Vercel:** import the repository and set the project root to `frontend`. Add `VITE_API_URL` with the public Render API address (for example, `https://project-dora-api.onrender.com`). `frontend/vercel.json` handles page refreshes on routes such as `/discover` and `/workspace`.
- **Render:** create a Blueprint from the repository root using `render.yaml`. Once both services are deployed, set the Render environment variable `FRONTEND_ORIGINS` to the exact Vercel site origin (for example, `https://project-dora.vercel.app`, without a trailing slash).
- **Health check:** the backend exposes `/health` for Render's service monitor.

The Render Blueprint uses the free web-service plan. Its local SQLite account and saved-project database is temporary on that plan, so user accounts and saved work may be lost when the service is redeployed or its instance is replaced. Use persistent storage or a managed database before inviting users to rely on saved accounts and projects. The app does not need an AI provider key; `BRAVE_SEARCH_API_KEY` is optional and should only be entered in Render's private environment settings if broader web search is needed.

## Configuration and data

Environment files are excluded from this deliverable. Use the `.env.example` files as templates and keep any optional search key private. Account history and saved projects are stored in the local SQLite database at `backend/database/dora_auth.sqlite3`; PDFs are created in `backend/reports/`. The legacy `/projects` API now returns only the signed-in user's saved projects.
