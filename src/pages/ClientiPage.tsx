import { useState } from "react";
type Cliente = { id: number; nome: string; email: string };
export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([
    { id: 1, nome: "Mario Rossi", email: "mario@example.com" },
    { id: 2, nome: "Luigi Verdi", email: "luigi@example.com" },
  ]);
  return (
    <div className="card">
      <h2>Clienti</h2>
      <ul>
        {clienti.map(c => <li key={c.id}>{c.nome} – {c.email}</li>)}
      </ul>
    </div>
  );
}
