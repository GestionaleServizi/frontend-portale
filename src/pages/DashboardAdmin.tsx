import React, { useEffect, useMemo, useState } from "react";

/**
 * Tipi (allineati al tuo backend)
 */
type Segnalazione = {
  id: number;
  data: string;          // ISO date (YYYY-MM-DD)
  ora: string;           // HH:mm
  descrizione?: string | null;
  cliente_id: number | null;
  categoria_id: number | null;
  created_at?: string | null;
  // opzionale: nomi joinati dal backend
  cliente_nome?: string | null;
  categoria_nome?: string | null;
};

type Cliente = { id: number; nome_sala: string; codice_sala: string };
type Categoria = { id: number; nome_categoria: string };

type PagedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

/**
 * Helper fetch con header Authorization automatico
 */
async function apiGet<T>(path: string, params: Record<string, any> = {}): Promise<T> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}` !== "") qs.append(k, String(v));
  });
  const token = localStorage.getItem("token") || "";
  const url = `${API_BASE}${path}${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "Accept": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    credentials: "omit",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET ${path} failed (${res.status})`);
  }
  return res.json();
}

export default function DashboardAdmin() {
  // sorgenti dati per filtri
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);

  // dati lista
  const [rows, setRows] = useState<Segnalazione[]>([]);
  const [total, setTotal] = useState(0);

  // stato filtri
  const [q, setQ] = useState("");
  const [clienteId, setClienteId] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<string>("");
  const [from, setFrom] = useState<string>(""); // YYYY-MM-DD
  const [to, setTo] = useState<string>("");     // YYYY-MM-DD

  // paginazione
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // stato UI
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  // carica filtri (clienti/categorie) una volta sola
  useEffect(() => {
    (async () => {
      try {
        const [cli, cat] = await Promise.all([
          apiGet<Cliente[]>("/api/clienti"),
          apiGet<Categoria[]>("/api/categorie"),
        ]);
        setClienti(cli);
        setCategorie(cat);
      } catch (e: any) {
        // non blocca la dashboard, ma mostriamo errore
        setErr(e?.message || "Errore nel caricare filtri");
      }
    })();
  }, []);

  // carica tabella quando cambiano filtri o paginazione
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await apiGet<PagedResponse<Segnalazione>>("/api/segnalazioni", {
          page,
          pageSize,
          q,
          cliente_id: clienteId || undefined,
          categoria_id: categoriaId || undefined,
          from: from || undefined,
          to: to || undefined,
          scope: "admin", // se il backend distingue scope
        });
        setRows(data.items);
        setTotal(data.total);
      } catch (e: any) {
        setErr(e?.message || "Errore nel caricare le segnalazioni");
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, q, clienteId, categoriaId, from, to]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const resetFiltri = () => {
    setQ("");
    setClienteId("");
    setCategoriaId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Amministratore</h1>

      {/* FILTRI */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4 bg-white rounded-xl p-3 shadow">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Cerca descrizione…"
          className="border rounded-lg px-3 py-2 md:col-span-2"
        />
        <select
          value={clienteId}
          onChange={(e) => { setClienteId(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Tutte le sale</option>
          {clienti.map(c => (
            <option key={c.id} value={c.id}>
              {c.nome_sala} ({c.codice_sala})
            </option>
          ))}
        </select>
        <select
          value={categoriaId}
          onChange={(e) => { setCategoriaId(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">Tutte le categorie</option>
          {categorie.map(c => (
            <option key={c.id} value={c.id}>{c.nome_categoria}</option>
          ))}
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => { setFrom(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => { setTo(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2"
        />

        <div className="md:col-span-6 flex gap-2 justify-end">
          <button
            onClick={resetFiltri}
            className="px-3 py-2 rounded-lg border"
          >
            Reset
          </button>
        </div>
      </div>

      {/* STATO */}
      {err && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {err}
        </div>
      )}

      {/* TABELLA */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-left px-3 py-2">ID</th>
              <th className="text-left px-3 py-2">Data</th>
              <th className="text-left px-3 py-2">Ora</th>
              <th className="text-left px-3 py-2">Sala</th>
              <th className="text-left px-3 py-2">Categoria</th>
              <th className="text-left px-3 py-2">Descrizione</th>
              <th className="text-left px-3 py-2">Creato il</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Caricamento…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">Nessun risultato</td></tr>
            ) : (
              rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.data}</td>
                  <td className="px-3 py-2">{r.ora}</td>
                  <td className="px-3 py-2">{r.cliente_nome ?? r.cliente_id}</td>
                  <td className="px-3 py-2">{r.categoria_nome ?? r.categoria_id}</td>
                  <td className="px-3 py-2">{r.descrizione ?? "-"}</td>
                  <td className="px-3 py-2">{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINAZIONE */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-600">
          Totale: <b>{total}</b>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="border rounded-lg px-2 py-1"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pag</option>)}
          </select>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded-lg border disabled:opacity-50"
          >
            ‹
          </button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1 rounded-lg border disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
