# pyanimation01

App de prueba **React (JS) + FastAPI** para verificar el deploy en Railway.

## Estructura

```text
backend/    FastAPI  → GET /api/hello → {"message": "Hola mundo"}
frontend/   React + Vite
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

Abre `http://localhost:5173`. En local el proxy de Vite reenvía `/api` al backend.

## Deploy en Railway (Hobby)

Crea **dos servicios** desde el mismo repo de GitHub:

### 1) Backend

1. New Service → GitHub → `hedulove/pyanimation01`
2. Settings → **Root Directory**: `backend`
3. Start command (si hace falta):

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

4. Settings → Networking → **Generate Domain**
5. (Opcional) Variable:

```text
ALLOWED_ORIGINS=https://TU-FRONTEND.up.railway.app
```

Copia la URL pública del backend (ej. `https://pyanimation01-backend.up.railway.app`).

### 2) Frontend

1. New Service → mismo repo
2. Settings → **Root Directory**: `frontend`
3. Build command: `npm run build`
4. Start command: `npm start` (usa `serve` sobre `dist`)
5. Variable de entorno:

```text
VITE_API_URL=https://TU-BACKEND.up.railway.app
```

> Importante: `VITE_*` se inyecta en **build time**. Después de poner `VITE_API_URL`, vuelve a desplegar el frontend.

6. Generate Domain en el frontend y abre esa URL.

Deberías ver **Hola mundo** leído desde FastAPI.

## Endpoints de prueba

| Ruta | Respuesta |
|---|---|
| `GET /` | `{"message":"Hola mundo desde FastAPI"}` |
| `GET /api/hello` | `{"message":"Hola mundo"}` |
| `GET /health` | `{"status":"ok"}` |
