import React, { useEffect, useState } from "react";
import { getClienti, createCliente } from "../api";

type Cliente = {
  id: number;
  nome_sala: string;
  codice_sala: string;
  email?: string;
  referente?: string;
  telefono?: string;
};

export default function ClientiPage() {
  const [rows, setRows] = useState<Cliente[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getClienti();
      setRows(data);
    } catch {
      setMsg("Errore nel caricamento clienti");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    try {
      await createCliente({
        nome_sala: "Nuova Sala",
        codice_sala: `SALA-${Date.now()}`,
      });
      load();
    } catch {
      setMsg("Errore nella creazione cliente");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Clienti</h1>
      {msg && <p>{msg}</p>}
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Aggiungi Cliente
      </button>
      <ul>
        {rows.map((c) => (
          <li key={c.id}>
            {c.nome_sala} ({c.codice_sala})
          </li>
        ))}
      </ul>
    </div>
  );
}
