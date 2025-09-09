// src/pages/Segnalazione.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorie, createSegnalazione } from "./api";

type Categoria = { id: number; nome_categoria: string };

function todayISO(): string {
  // yyyy-mm-dd
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function nowHHMM(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function Segnalazione() {
  const nav = useNavigate();

  // campi form
  const [data, setData] = useState<string>(todayISO);
  const [ora, setOra] = useState<string>(nowHHMM);
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState("");

  // stato UI
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // controllo token (guard client-side)
  const token = useMemo(() => localStorage.getItem("token"), []);
  useEffect(() => {
    if (!token) {
      // se non autenticato → login
      nav("/login", { replace: true });
    }
  }, [token, nav]);

  // carico categorie (route protetta; se 401 → torna al login)
  useEffect(() => {
    let alive = true;
    async function run() {
      setError(null);
      try {
        const rows = await getCategorie();
        if (!alive) return;
        setCategorie(rows);
      } catch (e: any) {
        // se le API hanno risposto 401/invalid token, torno al login
        const text = String(e?.message || e);
        setError(text || "Errore nel caricamento categorie");
        if (/401|unauthorized|invalid token|missing token/i.test(text)) {
          setTimeout(() => nav("/login", { replace: true }), 300);
        }
      }
    }
    run();
    return () => {
      alive = false;
    };
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);

    if (!categoriaId) {
      setError("Seleziona una categoria.");
      return;
    }
    if (!descrizione.trim()) {
      setError("Inserisci una descrizione.");
      return;
    }

    setLoading(true);
    try {
      await createSegnalazione({
        data,              // yyyy-mm-dd
        ora,               // HH:mm
        categoria_id: categoriaId,
        descrizione: descrizione.trim(),
      });

      setMsg("Segnalazione salvata con successo.");
      // reset dei campi principali per inserire rapidamente una nuova segnalazione
      setCategoriaId("");
      setDescrizione("");
      // mantengo data/ora correnti
      setOra(nowHHMM());
    } catch (e: any) {
      const text = String(e?.message || e);
      setError(text || "Errore nel salvataggio della segnalazione");
      if (/401|unauthorized|invalid token|missing token/i.test(text)) {
        // token scaduto/assente
        setTimeout(() => nav("/login", { replace: true }), 300);
      }
    } finally {
      setLoading(false);
    }
  }

  function annulla() {
    // torna alla home operatore (o login se preferisci)
    const role = localStorage.getItem("role");
    if (role === "admin") {
      nav("/dashboard", { replace: true });
    } else {
      // per ora torna al login; cambia in una "home operatore" quando sarà pronta
      nav("/login", { replace: true });
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Nuova Segnalazione</h1>

        {/* messaggi di stato */}
        {msg && <div style={{ ...styles.alert, ...styles.success }}>{msg}</div>}
        {error && <div style={{ ...styles.alert, ...styles.error }}>{error}</div>}

        <form onSubmit={onSubmit} style={styles.form}>
          <div style={styles.row}>
            <label style={styles.label}>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Ora</label>
            <input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) =>
                setCategoriaId(e.target.value ? Number(e.target.value) : "")
              }
              style={styles.input}
              required
            >
              <option value="">— Seleziona —</option>
              {categorie.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_categoria}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Descrizione</label>
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.target.value)}
              rows={4}
              style={{ ...styles.input, resize: "vertical" }}
              placeholder="Descrivi la segnalazione…"
              required
            />
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={annulla} style={styles.btnGhost}>
              Annulla
            </button>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Salvataggio…" : "Salva segnalazione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* stile inline minimale/dark: puoi spostarlo in styles.css quando vuoi */
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0f172a", // slate-900
    color: "#e2e8f0", // slate-200
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: 680,
    background: "#111827", // gray-900
    border: "1px solid #1f2937", // gray-800
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
  },
  title: {
    margin: 0,
    marginBottom: 16,
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 0.3,
  },
  alert: {
    padding: "10px 12px",
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  success: {
    background: "rgba(16,185,129,.1)", // emerald
    border: "1px solid rgba(16,185,129,.35)",
    color: "#a7f3d0",
  },
  error: {
    background: "rgba(239,68,68,.1)", // red
    border: "1px solid rgba(239,68,68,.35)",
    color: "#fecaca",
  },
  form: {
    display: "grid",
    gap: 12,
  },
  row: {
    display: "grid",
    gap: 6,
  },
  label: {
    fontSize: 13,
    color: "#94a3b8", // slate-400
  },
  input: {
    background: "#0b1220",
    border: "1px solid #1f2937",
    color: "#e2e8f0",
    padding: "10px 12px",
    borderRadius: 10,
    outline: "none",
  },
  actions: {
    display: "flex",
    gap: 8,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  btn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
  btnGhost: {
    background: "transparent",
    color: "#e2e8f0",
    border: "1px solid #334155",
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
  },
};
