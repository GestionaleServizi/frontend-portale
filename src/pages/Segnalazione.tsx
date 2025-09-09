// src/pages/Segnalazione.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSegnalazione, getCategorie, getToken } from "../api";

type Categoria = { id: number; nome_categoria: string };

export default function SegnalazionePage() {
  const nav = useNavigate();

  const [data, setData] = useState<string>(() => new Date().toISOString().slice(0, 10)); // yyyy-mm-dd
  const [ora, setOra] = useState<string>(() => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  });

  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(getToken, [/* none */]);

  // Se non c'è token → torna al login
  useEffect(() => {
    if (!token) {
      nav("/login", { replace: true });
    }
  }, [token, nav]);

  // Carico categorie (protetto)
  useEffect(() => {
    let alive = true;
    async function run() {
      setError(null);
      try {
        const rows = await getCategorie();
        if (!alive) return;
        setCategorie(rows);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Errore nel caricamento categorie");
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    if (!categoriaId) {
      setError("Seleziona una categoria.");
      return;
    }
    setLoading(true);
    try {
      await createSegnalazione({
        data,
        ora,
        categoria_id: Number(categoriaId),
        descrizione: descrizione.trim(),
      });
      setMsg("Segnalazione inserita con successo.");
      // reset soft
      setDescrizione("");
      setCategoriaId("");
    } catch (e: any) {
      setError(e?.message || "Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>Nuova Segnalazione</h1>

      {!token && <p>Reindirizzamento al login…</p>}

      {error && (
        <div className="error" style={{ marginBottom: 12 }}>
          {error}
        </div>
      )}
      {msg && (
        <div className="success" style={{ marginBottom: 12 }}>
          {msg}
        </div>
      )}

      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 640 }}>
        <div className="grid two">
          <label>
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />
          </label>

          <label>
            Ora
            <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} required />
          </label>
        </div>

        <label>
          Categoria
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            <option value="">Seleziona…</option>
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </select>
        </label>

        <label>
          Descrizione
          <textarea
            rows={4}
            placeholder="Descrivi la segnalazione…"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            required
          />
        </label>

        <div className="actions">
          <button type="button" onClick={() => nav(-1)} className="secondary">
            Annulla
          </button>
          <button disabled={loading} type="submit">
            {loading ? "Salvataggio…" : "Salva segnalazione"}
          </button>
        </div>
      </form>
    </div>
  );
}
