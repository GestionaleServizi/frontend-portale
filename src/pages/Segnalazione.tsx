// src/pages/Segnalazione.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getCategorie, type Categoria, createSegnalazione } from "../api";

export default function Segnalazione() {
  const nav = useNavigate();

  // form state
  const [data, setData] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [ora, setOra] = useState<string>(() => {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  });
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState<string>("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // token (se assente ➜ back dirottato dal Protected nel router, ma metto guardia extra)
  const token = useMemo(() => localStorage.getItem("token"), []);

  // se non c'è token (in modalità JWT), prova a continuare: se il backend è in “test senza JWT”
  // le rotte potrebbero comunque permettere l’accesso. Se il backend richiede token, cadrà in 401
  // e mostreremo un messaggio + redirect al login.
  useEffect(() => {
    let alive = true;

    async function load() {
      setError(null);
      setMsg(null);
      try {
        const list = await getCategorie();
        if (!alive) return;
        setCategorie(list);
      } catch (e: any) {
        if (!alive) return;
        const m = String(e?.message || e);
        setError(m);
        // se è chiaramente un problema di auth, rimanda al login
        if (m.toLowerCase().includes("unauthorized") || m.startsWith("HTTP 401")) {
          setTimeout(() => nav("/login", { replace: true }), 1000);
        }
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);
    try {
      if (!categoriaId || typeof categoriaId !== "number") {
        setError("Seleziona una categoria");
        setLoading(false);
        return;
      }
      await createSegnalazione({
        data,
        ora,
        categoria_id: categoriaId,
        descrizione: descrizione.trim(),
      });
      setMsg("Segnalazione salvata ✅");
      // reset basilare
      setDescrizione("");
      setCategoriaId("");
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1>Nuova Segnalazione</h1>

        {error && <p style={{ color: "#f87171", marginBottom: 12 }}>{error}</p>}
        {msg && <p style={{ color: "#4ade80", marginBottom: 12 }}>{msg}</p>}

        <form onSubmit={onSubmit} className="form">
          <label>Data</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} required />

          <label>Ora</label>
          <input type="time" value={ora} onChange={(e) => setOra(e.target.value)} required />

          <label>Categoria</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value ? Number(e.target.value) : "")}
            required
          >
            <option value="">— Seleziona —</option>
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Descrivi la segnalazione…"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={4}
          />

          <div className="actions">
            <button type="button" onClick={() => nav(-1)} className="btn ghost">
              Annulla
            </button>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Salvataggio…" : "Salva segnalazione"}
            </button>
          </div>
        </form>
      </div>

      {/* Stili minimi coerenti con il tuo dark theme attuale */}
      <style>{`
        .page { min-height: 100vh; display:flex; align-items:center; justify-content:center; background: radial-gradient(1200px 600px at 50% -200px, #1f2a44 0%, #0b1220 60%, #090f1a 100%); padding:20px; }
        .card { width: min(800px, 92vw); background: rgba(14,21,34,0.85); border:1px solid rgba(255,255,255,0.06);
                border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03);
                padding: 24px; color: #e5e7eb; backdrop-filter: blur(6px);}
        h1 { font-size: 26px; font-weight: 700; letter-spacing: .3px; color:#fff; margin:0 0 16px 0; }
        .form { display:grid; grid-template-columns: 1fr; gap: 12px; }
        label { font-size: 12px; text-transform: uppercase; color:#9fb3c8; letter-spacing:.08em;}
        input, select, textarea { background: #0f172a; color:#e5e7eb; border:1px solid rgba(255,255,255,.08);
          border-radius: 10px; padding: 10px 12px; outline:none; }
        input:focus, select:focus, textarea:focus { border-color:#60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.15); }
        textarea { resize: vertical; }
        .actions { display:flex; gap:10px; justify-content:flex-end; margin-top: 8px; }
        .btn { border-radius: 10px; padding: 10px 14px; border:1px solid rgba(255,255,255,.1); background:#111827; color:#e5e7eb; cursor:pointer; }
        .btn:hover { background:#0b1220; }
        .btn.primary { background:#2563eb; border-color:#2563eb; }
        .btn.primary:hover { background:#1d4ed8; }
        .btn.ghost { background: transparent; }
      `}</style>
    </div>
  );
}

