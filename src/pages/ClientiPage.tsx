import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function ClientiPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ nome_sala:"", codice_sala:"", email:"" });

  async function load() {
    setRows(await api.listClienti());
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api.upsertCliente(form);
    setForm({ nome_sala:"", codice_sala:"", email:"" });
    await load();
  }

  return (
    <div className="page">
      <h2>Clienti</h2>

      <form className="grid" onSubmit={save}>
        <input placeholder="Nome sala" value={form.nome_sala} onChange={e=>setForm({...form, nome_sala:e.target.value})}/>
        <input placeholder="Codice sala" value={form.codice_sala} onChange={e=>setForm({...form, codice_sala:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <button type="submit">Salva</button>
      </form>

      <table className="table">
        <thead><tr><th>Id</th><th>Nome</th><th>Codice</th><th>Email</th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.nome_sala}</td><td>{r.codice_sala}</td><td>{r.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
