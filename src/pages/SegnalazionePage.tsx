import React, { useEffect, useState } from "react";
import { api } from "../api";

export default function SegnalazionePage() {
  const [categorie, setCategorie] = useState<Array<{id:number; nome_categoria:string}>>([]);
  const [form, setForm] = useState({ data:"", ora:"", descrizione:"", categoria_id:0 });

  useEffect(() => { api.listCategorie().then(setCategorie); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.createSegnalazione(form);
    setForm({ data:"", ora:"", descrizione:"", categoria_id:0 });
    alert("Segnalazione inviata!");
  }

  return (
    <div className="page">
      <h2>Nuova segnalazione</h2>
      <form className="grid" onSubmit={submit}>
        <input type="date" value={form.data} onChange={e=>setForm({...form, data:e.target.value})}/>
        <input type="time" value={form.ora} onChange={e=>setForm({...form, ora:e.target.value})}/>
        <select value={form.categoria_id} onChange={e=>setForm({...form, categoria_id:Number(e.target.value)})}>
          <option value={0}>Seleziona categoria…</option>
          {categorie.map(c => <option key={c.id} value={c.id}>{c.nome_categoria}</option>)}
        </select>
        <textarea placeholder="Descrizione" value={form.descrizione} onChange={e=>setForm({...form, descrizione:e.target.value})}/>
        <button type="submit">Invia</button>
      </form>
    </div>
  );
}

