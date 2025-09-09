// src/pages/Segnalazione.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createSegnalazione,
  getCategorie,
  isLoggedIn,
  getRole,
  Categoria,
} from "../api";

export default function Segnalazione() {
  const nav = useNavigate();

  // Stato dei campi
  const [data, setData] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [ora, setOra] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  });
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState<string>("");

  // Stato messaggi
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Se non loggato → torna al login
  useEffect(() => {
    if (!isLoggedIn()) {
      nav("/login", { replace: true });
    }
  }, [nav]);

  // Carico categorie
  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const rows = await getCategorie();
        if (alive) setCategorie(rows);
      } catch (err: any) {
        if (alive) setError(err.message || "Errore caricamento categorie");
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);
    try {
      const res = await createSegnalazione({
        data,
        ora,
        categoria_id: categoriaId,
        descrizione,
      });
      setMsg(`Segnalazione salvata (id=${res.id})`);
      setDescrizione("");
      setCategoriaId("");
    } catch (err: any) {
      setError(err.message || "Errore salvataggio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2>Nuova Segnalazione</h2>

      {msg && <p style={{ color: "green" }}>{msg}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Data
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Ora
            <input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Categoria
            <select
              value={categoriaId}
              onChange={(e) =>
                setCategoriaId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">-- Seleziona --</option>
              {categorie.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_categoria}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Descrizione
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              required
            />
          </label>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <button type="button" onClick={() => nav(-1)} disabled={loading}>
            Annulla
          </button>
          <button type="submit" disabled={loading}>
            {loading ? "Salvataggio…" : "Salva segnalazione"}
          </button>
        </div>
      </form>
    </div>
  );
}
