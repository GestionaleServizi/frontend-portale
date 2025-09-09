import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Helpers
function getToken() {
  return localStorage.getItem("token");
}

const API_BASE = import.meta.env.VITE_API_BASE_URL; // deve finire con /api

async function apiFetch(path: string, init?: RequestInit) {
  const token = getToken();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000); // 15s

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    signal: ctrl.signal,
  }).catch((e) => {
    throw new Error(e?.name === "AbortError" ? "Timeout" : (e?.message || "Network error"));
  });
  clearTimeout(timer);

  if (res.status === 401) {
    const msg = (await res.text().catch(() => "")) || "Unauthorized";
    const err = new Error(msg);
    // @ts-expect-error custom flag
    err.code = 401;
    throw err;
  }
  if (!res.ok) {
    const msg = (await res.text().catch(() => "")) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const navigate = useNavigate();

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const now = useMemo(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mi}`;
  }, []);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [data, setData] = useState(today);
  const [ora, setOra] = useState(now);
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const token = getToken();
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }
        const cats = (await apiFetch("/categorie")) as Categoria[];
        if (!alive) return;
        setCategorie(cats);
      } catch (e: any) {
        if (e?.code === 401) {
          // token scaduto o assente → login
          navigate("/login", { replace: true });
          return;
        }
        setErr(e?.message || "Errore nel caricamento categorie");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  async function salva(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      if (!categoriaId) throw new Error("Seleziona una categoria");
      await apiFetch("/segnalazioni", {
        method: "POST",
        body: JSON.stringify({
          data,
          ora,
          categoria_id: categoriaId,
          descrizione,
        }),
      });
      // dopo salvataggio: vai dashboard o resetta form
      setDescrizione("");
      setCategoriaId("");
      alert("Segnalazione salvata");
    } catch (e: any) {
      if (e?.code === 401) {
        navigate("/login", { replace: true });
        return;
      }
      setErr(e?.message || "Errore nel salvataggio");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0e] text-white p-6">
        <div className="max-w-3xl mx-auto">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Nuova Segnalazione</h1>

        {err && <div className="mb-4 text-red-400 text-sm">{err}</div>}

        <form onSubmit={salva} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-gray-300">Data</span>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.currentTarget.value)}
                className="mt-1 w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-300">Ora</span>
              <input
                type="time"
                value={ora}
                onChange={(e) => setOra(e.currentTarget.value)}
                className="mt-1 w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
                required
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-gray-300">Categoria</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.currentTarget.value ? Number(e.currentTarget.value) : "")}
              className="mt-1 w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
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

          <label className="block">
            <span className="text-sm text-gray-300">Descrizione</span>
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.currentTarget.value)}
              rows={4}
              className="mt-1 w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
              placeholder="Descrivi la segnalazione…"
              required
            />
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="rounded-md bg-[#23232b] hover:bg-[#2b2b35] transition-colors px-4 py-2"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="rounded-md bg-[#6c5ce7] hover:bg-[#5a49e0] transition-colors px-4 py-2 font-medium"
            >
              Salva segnalazione
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
