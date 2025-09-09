import React, { useEffect, useState } from "react";
import {
  getCategorie,
  createCategoria,
  deleteCategoria,
} from "../api";

type Categoria = {
  id: number;
  nome_categoria: string;
};

export default function CategoriePage() {
  const [rows, setRows] = useState<Categoria[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getCategorie();
      setRows(data);
    } catch {
      setMsg("Errore nel caricamento categorie");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    try {
      await createCategoria("Nuova Categoria");
      load();
    } catch {
      setMsg("Errore nella creazione categoria");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCategoria(id);
      load();
    } catch {
      setMsg("Errore nell'eliminazione categoria");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Categorie</h1>
      {msg && <p>{msg}</p>}
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Aggiungi Categoria
      </button>
      <ul>
        {rows.map((c) => (
          <li key={c.id}>
            {c.nome_categoria}
            <button
              onClick={() => handleDelete(c.id)}
              className="ml-2 px-2 py-1 bg-red-600 text-white rounded"
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
