import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSegnalazioni } from "../api";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  nome_categoria?: string;
  nome_sala?: string;
};

export default function DashboardAdmin() {
  const [rows, setRows] = useState<Segnalazione[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) nav("/login", { replace: true });

    getSegnalazioni()
      .then(setRows)
      .catch(() => setMsg("Errore nel caricamento segnalazioni"));
  }, [nav]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Dashboard Admin</h1>
      {msg && <p>{msg}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th>ID</th>
            <th>Data</th>
            <th>Ora</th>
            <th>Categoria</th>
            <th>Sala</th>
            <th>Descrizione</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b">
              <td>{r.id}</td>
              <td>{r.data}</td>
              <td>{r.ora}</td>
              <td>{r.nome_categoria}</td>
              <td>{r.nome_sala}</td>
              <td>{r.descrizione}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
