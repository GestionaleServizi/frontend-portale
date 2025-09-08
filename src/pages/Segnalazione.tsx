import { useEffect, useState } from 'react';

type Segnalazione = {
  id: number;
  data: string;       // ISO date
  ora: string;
  descrizione?: string;
  categoria_id?: number;
  cliente_id?: number;
  created_at?: string;
};

export default function Segnalazione() {
  const [items, setItems] = useState<Segnalazione[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    fetch(`${base}/segnalazioni`, { credentials: 'omit' })
      .then(async r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card"><p>Caricamento…</p></div>;
  if (error)   return <div className="card error"><p>Errore: {error}</p></div>;

  return (
    <div className="card">
      <h2>Segnalazioni</h2>
      {items.length === 0 ? (
        <p>Nessuna segnalazione trovata.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Ora</th>
                <th>Descrizione</th>
                <th>Categoria</th>
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.data}</td>
                  <td>{s.ora}</td>
                  <td>{s.descrizione || '-'}</td>
                  <td>{s.categoria_id ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
