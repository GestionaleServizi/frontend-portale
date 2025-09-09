import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const nav = useNavigate();

  // ----- stato form -----
  const [data, setData] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [ora, setOra] = useState<string>(() => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  });
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState<string>("");

  // ----- stato ui -----
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ----- categorie -----
  const [categorie, setCategorie] = useState<Categoria[]>([]);

  // token dal localStorage (senza triggerare re-render continui)
  const token = useMemo(() => localStorage.getItem("token"), []);

  // se non c'è token -> torna al login
  useEffect(() => {
    if (!token) {
      nav("/login", { replace: true });
    }
  }, [token, nav]);

  // carica le categorie (route protetta)
  useEffect(() => {
    let alive = true;
    async function run() {
      setError(null);
      try {
        const rows = await api.listCategorie(); // <— usa l'oggetto api
        if (!alive) return;
        setCategorie(rows);
      } catch (err: any) {
        if (!alive) return;
        setError(err?.message || "Errore nel caricamento categorie");
      }
    }
    if (token) run();
    return () => {
      alive = false;
    };
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);

    if (!token) {
      nav("/login", { replace: true });
      return;
    }
    if (!categoriaId) {
      setError("Seleziona una categoria");
      return;
    }

    setLoading(true);
    try {
      await api.createSegnalazione({
        data,
        ora,
        categoria_id: Number(categoriaId),
        descrizione,
      }); // <— usa l'oggetto api

      setMsg("Segnalazione salvata con successo");
      // reset (lascia data/ora)
      setCategoriaId("");
      setDescrizione("");
    } catch (err: any) {
      setError(err?.message || "Errore nel salvataggio");
    } finally {
      setLoading(false);
    }
  }

  // --- UI ---
  return (
    <div className="page page--center">
      <div className="card">
        <h1>Nuova Segnalazione</h1>

        {error && <div className="alert alert--error">{error}</div>}
        {msg && <div className="alert alert--ok">{msg}</div>}

        <form onSubmit={onSubmit} className="form">
          <label>
            <span>Data</span>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </label>

          <label>
            <span>Ora</span>
            <input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.target.value)}
              required
            />
          </label>

          <label>
            <span>Categoria</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}
              disabled={!categorie.length}
              required
            >
              <option value="">— Seleziona —</option>
              {categorie.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_categoria}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Descrizione</span>
            <textarea
              rows={4}
              placeholder="Descrivi la segnalazione…"
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              required
            />
          </label>

          <div className="form__actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => nav(-1)}
              disabled={loading}
            >
              Annulla
            </button>
            <button className="btn btn--primary" disabled={loading}>
              {loading ? "Salvataggio…" : "Salva segnalazione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
