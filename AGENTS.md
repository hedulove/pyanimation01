# pyanimation01

Demo React (Vite) + FastAPI chatbot ("Signal") with prefabricated (non-LLM) replies.

## Cursor Cloud specific instructions

Two services, run both for local dev (setup/run commands are in `README.md`):

- **Backend** (`backend/`): FastAPI served by uvicorn on port `8000`. Dependencies are installed into `backend/.venv` (the update script creates it). Run with `backend/.venv/bin/uvicorn main:app --reload --port 8000`. No tests or lint config exist.
- **Frontend** (`frontend/`): React + Vite dev server on port `5173`. Run with `npm run dev` from `frontend/`. No tests or lint config exist.

Non-obvious caveats:
- The Vite dev server binds to `localhost` only. Use `http://localhost:5173` (not `127.0.0.1`) to reach it, and start the backend first — Vite proxies `/api` and `/health` to `127.0.0.1:8000` (see `frontend/vite.config.js`).
- In dev mode the frontend uses relative `/api` requests through the Vite proxy, so no `API_URL`/`VITE_API_URL` env var is needed locally. Those vars only matter for the Railway production deploy (`frontend/server.mjs` serves the built `dist/` and exposes `/runtime-config.json`).
