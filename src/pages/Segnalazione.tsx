import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

type Categoria = {
  id: number;
  nome_categoria: string;
};

export default function Segnalazione() {
  const nav = useNavigate();

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

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 🔹 se non c’è token → redirect al login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login", { replace: true });
    }
  }, [nav]);

  // 🔹 carico categorie
  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const rows = await api.getCategorie();
        if (alive) setCategorie(rows);
      } catch (err: any) {
        setMsg("Errore nel caricamento categorie");
        console.error(err);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  // 🔹 submit segnalazione
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    try {
      await api.createSegnalazione({
        data,
        ora,
        categoria_id: categoriaId,
        descrizione,
      });
      setMsg("✅ Segnalazione salvata con successo");
      setDescrizione("");
      setCategoriaId("");
    } catch (err: any) {
      setMsg("❌ Errore nel salvataggio della segnalazione");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Nuova Segnalazione</h1>

      {msg && <div className="mb-4 text-center">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Data</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-1">Ora</label>
          <input
            type="time"
            value={ora}
            onChange={(e) => setOra(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          />
        </div>

        <div>
          <label className="block mb-1">Categoria</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
          >
            <option value="">-- Seleziona --</option>
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">Descrizione</label>
          <textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            rows={4}
            placeholder="Descrivi la segnalazione..."
          />
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => nav("/dashboard")}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Salvataggio..." : "Salva segnalazione"}
          </button>
        </div>
      </form>
    </div>
  );
}
