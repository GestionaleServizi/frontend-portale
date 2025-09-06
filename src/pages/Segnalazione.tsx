import { useState } from "react";
export default function Segnalazione() {
  const [form, setForm] = useState({ titolo: "", descrizione: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Invio segnalazione: ${form.titolo}`);
  };
  return (
    <div className="card" style={{maxWidth: 560}}>
      <h2>Nuova Segnalazione</h2>
      <form onSubmit={submit} className="grid">
        <input placeholder="Titolo" value={form.titolo} onChange={e=>setForm(s=>({ ...s, titolo: e.target.value }))} />
        <textarea placeholder="Descrizione" rows={6} value={form.descrizione} onChange={e=>setForm(s=>({ ...s, descrizione: e.target.value }))} />
        <button type="submit">Invia</button>
      </form>
    </div>
  );
}
