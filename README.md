# pyanimation01

Demo **React (Vite) + FastAPI** con un chatbot de simulación (`Signal`) para probar el deploy en Railway.

## Estructura

```text
backend/    FastAPI  → POST /api/chat (respuestas prefabricadas)
frontend/   React chat UI
```

## Desarrollo local

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Vite reenvía `/api` al backend.

## Deploy en Railway (Hobby)

Dos servicios desde el mismo repo:

### 1) Backend

- Root Directory: `backend`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Generate Domain

### 2) Frontend

- Root Directory: `frontend`
- Variable **obligatoria** (runtime, no hace falta rebuild de Vite):

```text
API_URL=https://pyanimation01-production.up.railway.app
```

  (usa el dominio real de tu servicio FastAPI)

- También puedes usar `VITE_API_URL` (se lee en build y en runtime)
- Redeploy del frontend después de guardar la variable
- Generate Domain

Si el chat dice error y abajo aparece `API (sin configurar)`, falta `API_URL`.

## API

| Ruta | Descripción |
|---|---|
| `GET /health` | Healthcheck |
| `GET /api/hello` | Hola mundo |
| `GET /api/starters` | Sugerencias iniciales |
| `POST /api/chat` | `{ "message": "hola" }` → reply + intent + suggestions |

Ejemplo:

```bash
curl -X POST https://TU-BACKEND.up.railway.app/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"cuéntame un chiste"}'
```

Las respuestas son **prefabricadas** (sin LLM). Sirve para validar front ↔ back, CORS y UX.
