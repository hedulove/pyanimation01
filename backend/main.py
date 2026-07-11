import os
import random
import re
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="pyanimation01 Chat API")

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


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    intent: str
    suggestions: list[str]


STARTERS = [
    "¿Qué puedes hacer?",
    "Cuéntame un chiste",
    "¿Cómo funciona Railway?",
    "¿Usas un LLM de verdad?",
]


RULES: list[tuple[str, re.Pattern[str], list[str]]] = [
    (
        "greeting",
        re.compile(
            r"\b(hola|hey|buenas|buenos dias|buenas tardes|buenas noches|hi|hello)\b",
            re.I,
        ),
        [
            "¡Hola! Soy Signal, un chatbot de simulación. Pregúntame por Railway, el stack o pide un chiste.",
            "Hola. Estoy listo para una demo rápida: React al frente, FastAPI atrás, respuestas prefabricadas en el medio.",
            "¡Hey! Bienvenido a pyanimation01. Escribe lo que quieras y te contesto con respuestas de prueba.",
        ],
    ),
    (
        "identity",
        re.compile(
            r"\b(quien eres|quién eres|que eres|qué eres|como te llamas|cómo te llamas|tu nombre)\b",
            re.I,
        ),
        [
            "Me llamo Signal. No soy un LLM real: el backend elige respuestas según palabras clave para probar el flujo front ↔ back.",
            "Soy un bot de demo en pyanimation01. Sirvo para validar deploy, CORS, variables de entorno y la UX del chat.",
        ],
    ),
    (
        "capabilities",
        re.compile(
            r"\b(que puedes|qué puedes|puedes hacer|ayuda|help|opciones|funciones)\b",
            re.I,
        ),
        [
            "Puedo saludar, explicar el stack, hablar de Railway, aclarar que no uso un LLM real y contar un chiste corto. Prueba una de las sugerencias.",
            "Demo mode: respondo con plantillas. Útil para ver latencia, diseño y el circuito completo React → FastAPI → React.",
        ],
    ),
    (
        "stack",
        re.compile(
            r"\b(stack|fastapi|react|frontend|backend|vite|tecnolog|python|javascript)\b",
            re.I,
        ),
        [
            "Stack de esta demo: frontend React + Vite, backend FastAPI en Linux, deploy en Railway con dos servicios.",
            "El front envía tu mensaje a POST /api/chat. FastAPI clasifica la intención y devuelve una respuesta prefabricada.",
        ],
    ),
    (
        "railway",
        re.compile(r"\b(railway|deploy|despliegue|dominio|hobby)\b", re.I),
        [
            "En Railway conviene un servicio para `backend/` y otro para `frontend/`. El front necesita VITE_API_URL apuntando al dominio del API.",
            "Si el backend ya muestra /api/hello, el chat usa el mismo origen: solo asegúrate de redesplegar el front tras cambiar VITE_API_URL.",
        ],
    ),
    (
        "llm",
        re.compile(
            r"\b(llm|openai|anthropic|gpt|claude|modelo|inteligencia artificial|ia)\b",
            re.I,
        ),
        [
            "Esta versión no llama a un LLM. Cuando quieras, se puede cablear OpenAI/Anthropic con una API key en variables de Railway.",
            "Ahora mismo todo es simulado a propósito: cero costo de tokens, respuestas deterministas y perfectas para probar el circuito.",
        ],
    ),
    (
        "joke",
        re.compile(r"\b(chiste|broma|joke|divertido|risa)\b", re.I),
        [
            "¿Por qué el frontend estaba triste? Porque el backend no le devolvía el CORS… y sin CORS no hay amor.",
            "Un byte llega a un bar y pide un bit. El barman dice: lo siento, aquí solo servimos full-stack.",
            "Railway le dijo al contenedor: ¡arranca! Y Uvicorn respondió: Application startup complete.",
        ],
    ),
    (
        "thanks",
        re.compile(r"\b(gracias|thank|thanks|te agradezco)\b", re.I),
        [
            "De nada. Si el mensaje aparece aquí, front y back ya están conversando bien.",
            "¡Con gusto! Cuando quieras, el siguiente paso puede ser conectar un LLM de verdad.",
        ],
    ),
    (
        "bye",
        re.compile(r"\b(adios|adiós|chao|bye|hasta luego|nos vemos)\b", re.I),
        [
            "Hasta luego. Que el deploy te sea ligero.",
            "Chao. Si vuelves, seguiré respondiendo con plantillas listas.",
        ],
    ),
]


FALLBACKS = [
    "Entendí tu mensaje, pero no tengo una plantilla exacta para eso. Prueba con Railway, stack, LLM o un chiste.",
    "Modo simulación: no genero texto libre. Pregúntame qué puedo hacer o usa una sugerencia.",
    "No encontré una intención clara. Di «hola», «ayuda» o «cuéntame un chiste» para ver respuestas distintas.",
]


def match_intent(text: str) -> tuple[str, str]:
    normalized = " ".join(text.strip().split())
    for intent, pattern, replies in RULES:
        if pattern.search(normalized):
            return intent, random.choice(replies)
    return "fallback", random.choice(FALLBACKS)


def suggestion_for(intent: str) -> list[str]:
    catalog: dict[str, list[str]] = {
        "greeting": ["¿Qué puedes hacer?", "¿Usas un LLM de verdad?", "Cuéntame un chiste"],
        "capabilities": ["¿Cómo funciona Railway?", "Explícame el stack", "Cuéntame un chiste"],
        "stack": ["¿Cómo funciona Railway?", "¿Usas un LLM de verdad?", "Hola"],
        "railway": ["Explícame el stack", "¿Usas un LLM de verdad?", "Gracias"],
        "llm": ["¿Qué puedes hacer?", "¿Cómo funciona Railway?", "Cuéntame un chiste"],
        "joke": ["Otro chiste", "¿Qué puedes hacer?", "Gracias"],
        "thanks": ["¿Qué puedes hacer?", "Cuéntame un chiste", "Adiós"],
        "bye": ["Hola", "¿Qué puedes hacer?"],
        "identity": ["¿Qué puedes hacer?", "¿Usas un LLM de verdad?", "Explícame el stack"],
        "fallback": STARTERS,
    }
    return catalog.get(intent, STARTERS)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "pyanimation01 chat API lista"}


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "Hola mundo"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/starters")
def starters() -> dict[str, list[str]]:
    return {"starters": STARTERS}


@app.post("/api/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    intent, reply = match_intent(payload.message)
    return ChatResponse(
        reply=reply,
        intent=intent,
        suggestions=suggestion_for(intent),
    )


@app.get("/api/debug/intents")
def debug_intents() -> dict[str, Any]:
    return {
        "intents": [intent for intent, _, _ in RULES] + ["fallback"],
        "starters": STARTERS,
    }
