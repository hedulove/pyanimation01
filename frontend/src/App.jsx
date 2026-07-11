import { useEffect, useRef, useState } from "react";

const BUILD_API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const DEFAULT_STARTERS = [
  "¿Qué puedes hacer?",
  "Cuéntame un chiste",
  "¿Cómo funciona Railway?",
  "¿Usas un LLM de verdad?",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "El backend no devolvió JSON. Suele pasar si falta API_URL/VITE_API_URL y /api/chat cae en el frontend.",
    );
  }
  return response.json();
}

export default function App() {
  const [apiBase, setApiBase] = useState(BUILD_API_BASE);
  const [configReady, setConfigReady] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "Soy Signal, un chatbot de simulación. React al frente, FastAPI atrás. Pregúntame algo para probar el circuito.",
    },
  ]);
  const [input, setInput] = useState("");
  const [starters, setStarters] = useState(DEFAULT_STARTERS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        const response = await fetch("/runtime-config.json", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const runtimeUrl = (data.apiUrl || "").replace(/\/$/, "");
          if (!cancelled && runtimeUrl) {
            setApiBase(runtimeUrl);
          }
        }
      } catch {
        /* keep build-time value */
      } finally {
        if (!cancelled) setConfigReady(true);
      }
    }

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!configReady) return;

    fetch(`${apiBase}/api/starters`)
      .then(async (res) => (res.ok ? readJson(res) : null))
      .then((data) => {
        if (data?.starters?.length) {
          setStarters(data.starters);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, [apiBase, configReady]);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(raw) {
    const text = raw.trim();
    if (!text || busy) return;

    if (!apiBase && !import.meta.env.DEV) {
      setError(
        "Falta API_URL en el servicio frontend de Railway (ej. https://pyanimation01-production.up.railway.app).",
      );
      setMessages((prev) => [
        ...prev,
        { id: createId(), role: "user", text },
        {
          id: createId(),
          role: "bot",
          text: "No hay URL de backend configurada. En Railway → frontend → Variables, agrega API_URL con el dominio del FastAPI y redespliega.",
          intent: "error",
        },
      ]);
      setInput("");
      return;
    }

    setError("");
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { id: createId(), role: "user", text }]);

    try {
      const response = await fetch(`${apiBase}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await readJson(response);
      await new Promise((resolve) => setTimeout(resolve, 450 + Math.random() * 500));

      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "bot",
          text: data.reply,
          intent: data.intent,
        },
      ]);

      if (Array.isArray(data.suggestions) && data.suggestions.length) {
        setStarters(data.suggestions.slice(0, 3));
      }
    } catch (err) {
      setError(err.message || "No se pudo contactar al backend");
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "bot",
          text: "No pude hablar con el backend. En el servicio frontend de Railway define API_URL=https://pyanimation01-production.up.railway.app y redespliega.",
          intent: "error",
        },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event) {
    event.preventDefault();
    sendMessage(input);
  }

  const missingApi = configReady && !apiBase && !import.meta.env.DEV;

  return (
    <main className="shell">
      <div className="atmosphere" aria-hidden="true">
        <span className="orb orb-a" />
        <span className="orb orb-b" />
        <span className="grid" />
      </div>

      <section className="stage">
        <header className="hero">
          <p className="brand">pyanimation01</p>
          <h1>Signal</h1>
          <p className="lede">
            Chatbot de simulación para validar front, back y deploy.
          </p>
        </header>

        {missingApi ? (
          <aside className="banner">
            <strong>Falta conectar el backend</strong>
            <p>
              En Railway → servicio <em>frontend</em> → Variables, agrega:
            </p>
            <code>API_URL=https://pyanimation01-production.up.railway.app</code>
            <p>Luego Redeploy. No hace falta rebuild de Vite si usas API_URL.</p>
          </aside>
        ) : null}

        <div className="chat" role="log" aria-live="polite">
          <div className="messages" ref={listRef}>
            {messages.map((message) => (
              <article
                key={message.id}
                className={`bubble bubble--${message.role}`}
              >
                <span className="who">
                  {message.role === "bot" ? "Signal" : "Tú"}
                  {message.intent ? ` · ${message.intent}` : ""}
                </span>
                <p>{message.text}</p>
              </article>
            ))}

            {busy ? (
              <article className="bubble bubble--bot bubble--typing">
                <span className="who">Signal</span>
                <p className="typing" aria-label="Escribiendo">
                  <i />
                  <i />
                  <i />
                </p>
              </article>
            ) : null}
          </div>

          <div className="composer">
            <div className="suggestions">
              {starters.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="suggestion"
                  disabled={busy || missingApi}
                  onClick={() => sendMessage(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="form">
              <label className="sr-only" htmlFor="chat-input">
                Mensaje
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe un mensaje…"
                autoComplete="off"
                disabled={busy || missingApi}
              />
              <button type="submit" disabled={busy || missingApi || !input.trim()}>
                Enviar
              </button>
            </form>

            {error ? <p className="error">Error: {error}</p> : null}
            <p className="meta">
              API <code>{apiBase || "(sin configurar)"}</code>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
