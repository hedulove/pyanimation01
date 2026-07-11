import { useEffect, useRef, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const DEFAULT_STARTERS = [
  "¿Qué puedes hacer?",
  "Cuéntame un chiste",
  "¿Cómo funciona Railway?",
  "¿Usas un LLM de verdad?",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
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
    fetch(`${API_BASE}/api/starters`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.starters?.length) {
          setStarters(data.starters);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
  }, []);

  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function sendMessage(raw) {
    const text = raw.trim();
    if (!text || busy) return;

    setError("");
    setInput("");
    setBusy(true);
    setMessages((prev) => [...prev, { id: createId(), role: "user", text }]);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      // Fake thinking pause so the demo feels conversational.
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
          text: "No pude hablar con el backend. Revisa VITE_API_URL y que el servicio FastAPI esté arriba.",
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
                  disabled={busy}
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
                disabled={busy}
              />
              <button type="submit" disabled={busy || !input.trim()}>
                Enviar
              </button>
            </form>

            {error ? <p className="error">Error: {error}</p> : null}
            <p className="meta">
              API <code>{API_BASE || "/api (proxy local)"}</code>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
