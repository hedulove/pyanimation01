import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="pyanimation01 API")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
origins = (
    ["*"]
    if allowed_origins.strip() == "*"
    else [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Hola mundo desde FastAPI"}


@app.get("/api/hello")
def hello():
    return {"message": "Hola mundo"}


@app.get("/health")
def health():
    return {"status": "ok"}
