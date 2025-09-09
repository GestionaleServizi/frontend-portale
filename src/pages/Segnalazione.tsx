import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getToken } from "../api";

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const nav = useNavigate();

  const now = new Date();
  const [data, setData] = useState<string>(now.toISOString().slice(0, 10));
  const [ora, setOra] = useState<string>(
    `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`
  );
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState("");
  const [cats, setCats] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // Carica categorie protette
  useEffect(() => {
    async function load() {
      setErr(null);
      setOkMsg(null);
      setLoading(true);

      const token = getToken();
      if (!token) {
        nav("/login", { replace: true });
        return;
      }

      try {
        const list = await apiFetch("/categorie", { method: "GET" });
        setCats(list || []);
      } catch (e: any) {
        // se apiFetch ha tolto il token per 401, torno al login
        if (!getToken()) {
          nav("/login", { replace: true });
          return;
        }
        setErr(e?.message || "Errore nel caricamento categorie");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);

    try {
      if (!categoriaId) throw new Error("Seleziona una categoria");
      await apiFetch("/segnalazioni", {
        method: "POST",
        body: JSON.stringify({
          data,
          ora,
          descrizione,
          categoria_id: Number(categoriaId),
        }),
      });
      setOkMsg("Segnalazione salvata.");
      setDescrizione("");
      setCategoriaId("");
    } catch (e: any) {
      if (!getToken()) {
        nav("/login", { replace: true });
        return;
      }
      setErr(e?.message || "Errore nel salvataggio");
    }
  }

  if (loading) return <div>Caricamento…</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Nuova Segnalazione</h1>

      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      {okMsg && (
        <div style={{ color: "seagreen", marginBottom: 12 }}>{okMsg}</div>
      )}

      <form onSubmit={onSubmit}>
        <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
          <label>
            Data
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.currentTarget.value)}
              style={{ display: "block", padding: 6 }}
            />
          </label>

          <label>
            Ora
            <input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.currentTarget.value)}
              style={{ display: "block", padding: 6 }}
            />
          </label>

          <label>
            Categoria
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(Number(e.currentTarget.value))}
              style={{ display: "block", padding: 6 }}
            >
              <option value="">— Seleziona —</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_categoria}
                </option>
              ))}
            </select>
          </label>

          <label>
            Descrizione
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.currentTarget.value)}
              rows={4}
              style={{ display: "block", padding: 6, width: "100%" }}
              placeholder="Descrivi la segnalazione…"
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => nav(-1)}
              style={{ padding: "8px 12px" }}
            >
              Annulla
            </button>
            <button type="submit" style={{ padding: "8px 12px" }}>
              Salva segnalazione
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
