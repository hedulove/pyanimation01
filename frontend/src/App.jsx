import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export default function App() {
  const [message, setMessage] = useState("Cargando…");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const url = `${API_BASE}/api/hello`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message || "Sin mensaje");
        setStatus("ok");
      })
      .catch((err) => {
        setError(err.message || "Error desconocido");
        setMessage("No se pudo contactar al backend");
        setStatus("error");
      });
  }, []);

  return (
    <main className="page">
      <div className="glow" aria-hidden="true" />
      <section className="panel">
        <p className="brand">pyanimation01</p>
        <h1>Hola mundo</h1>
        <p className="subtitle">
          Prueba React + FastAPI lista para Railway
        </p>

        <div className={`result result--${status}`}>
          <span className="label">Respuesta del backend</span>
          <strong>{message}</strong>
          {error ? <span className="error">Detalle: {error}</span> : null}
        </div>

        <p className="hint">
          API: <code>{API_BASE || "(proxy local /api)"}</code>
        </p>
      </section>
    </main>
  );
}
