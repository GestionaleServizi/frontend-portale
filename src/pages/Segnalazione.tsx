// src/pages/Segnalazione.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, getToken } from "../api";

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const nav = useNavigate();
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // valori di default data/ora (local)
  const now = useMemo(() => new Date(), []);
  const [data, setData] = useState(() => now.toISOString().slice(0, 10)); // yyyy-mm-dd
  const [ora, setOra] = useState(() => {
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  });
  const [categoriaId, setCategoriaId] = useState<number | "">("");
  const [descrizione, setDescrizione] = useState("");

  // Se non c'è token, rimbalza subito a login
  useEffect(() => {
    if (!getToken()) {
      nav("/login", { replace: true });
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const cats = await api.listCategorie();
        setCategorie(cats);
      } catch (e: any) {
        if (e?.message === "UNAUTHORIZED") {
          nav("/login", { replace: true });
          return;
        }
        setErr(e?.message || "Errore nel caricamento categorie");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!categoriaId) {
      setErr("Seleziona una categoria");
      return;
    }
    try {
      await api.creaSegnalazione({
        data,
        ora,
        categoria_id: Number(categoriaId),
        descrizione: descrizione?.trim() || "",
      });
      // dopo salvataggio: vai alla home operatore (o resetta il form)
      setDescrizione("");
      setCategoriaId("");
      alert("Segnalazione inserita!");
    } catch (e: any) {
      if (e?.message === "UNAUTHORIZED") {
        nav("/login", { replace: true });
        return;
      }
      setErr(e?.message || "Errore nel salvataggio");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Caricamento…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0e] text-white p-4">
      <div className="max-w-xl mx-auto bg-[#15151b] rounded-2xl p-6 shadow-lg border border-[#23232b]">
        <h1 className="text-xl font-semibold mb-4">Nuova Segnalazione</h1>

        {err && (
          <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Data</label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.currentTarget.value)}
                className="w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Ora</label>
              <input
                type="time"
                value={ora}
                onChange={(e) => setOra(e.currentTarget.value)}
                className="w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Categoria</label>
            <select
              value={categoriaId}
              onChange={(e) =>
                setCategoriaId(e.currentTarget.value ? Number(e.currentTarget.value) : "")
              }
              className="w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
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

          <div>
            <label className="block text-sm mb-1">Descrizione</label>
            <textarea
              value={descrizione}
              onChange={(e) => setDescrizione(e.currentTarget.value)}
              rows={5}
              className="w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
              placeholder="Dettagli della segnalazione…"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="rounded-md border border-[#2a2a34] px-3 py-2"
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
