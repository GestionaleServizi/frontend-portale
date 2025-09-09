// src/pages/Segnalazione.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isLoggedIn,
  getToken,
  getCategorie,
  createSegnalazione,
  type Categoria,
} from "../api";

export default function Segnalazione() {
  const nav = useNavigate();

  // --- redirect se non autenticato ---
  const token = useMemo(getToken, []);
  useEffect(() => {
    if (!token || !isLoggedIn()) {
      nav("/login", { replace: true });
    }
  }, [token, nav]);

  // --- stato form ---
  const [data, setData] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );
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

  // --- carica categorie (protetto) ---
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
        // se 401 il helper ha già fatto logout → torno al login
        if (e?.message === "UNAUTHORIZED") {
          nav("/login", { replace: true });
          return;
        }
        setError("Errore nel caricamento delle categorie");
        console.error(e);
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [nav]);

  // --- submit ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!categoriaId || !descrizione.trim()) {
      setError("Compila tutti i campi.");
      return;
    }

    setLoading(true);
    try {
      const res = await createSegnalazione({
        data,
        ora,
        categoria_id: Number(categoriaId),
        descrizione: descrizione.trim(),
      });
      if (res?.ok) {
        setMsg("Segnalazione creata con successo.");
        // reset soft
        setDescrizione("");
        setCategoriaId("");
      } else {
        setError("Errore nella creazione della segnalazione.");
      }
    } catch (e: any) {
      if (e?.message === "UNAUTHORIZED") {
        nav("/login", { replace: true });
        return;
      }
      setError(e?.message || "Errore di rete");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // --- UI minimale (poi rifiniremo tema dark ecc.) ---
  return (
    <div style={{ maxWidth: 680, margin: "40px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Nuova Segnalazione</h1>

      {msg && (
        <div style={{ padding: "8px 12px", background: "#e6ffed", border: "1px solid #b7eb8f", borderRadius: 6, marginBottom: 12 }}>
          {msg}
        </div>
      )}
      {error && (
        <div style={{ padding: "8px 12px", background: "#fff1f0", border: "1px solid #ffa39e", borderRadius: 6, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div>Data</div>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label>
            <div>Ora</div>
            <input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.target.value)}
            />
          </label>

          <label>
            <div>Categoria</div>
            <select
              value={categoriaId}
              onChange={(e) =>
                setCategoriaId(e.target.value ? Number(e.target.value) : "")
              }
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
            <div>Descrizione</div>
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={4}
              placeholder="Descrivi la segnalazione…"
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => nav("/", { replace: true })}
              disabled={loading}
            >
              Annulla
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Salvataggio…" : "Salva segnalazione"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
