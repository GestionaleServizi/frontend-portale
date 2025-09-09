import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api"; // usa l'helper centralizzato che aggiunge l'Authorization

type Ruolo = "admin" | "operatore";

type User = {
  id: number;
  email: string;
  ruolo: Ruolo;
  cliente_id?: number | null;
};

type Categoria = { id: number; nome_categoria: string };
type Cliente = { id: number; nome?: string; ragione_sociale?: string; email?: string };

type FormState = {
  data: string;        // yyyy-mm-dd
  ora: string;         // HH:mm
  categoria_id: string;
  descrizione: string;
  cliente_id?: string; // mostrato solo agli admin
};

export default function Segnalazione() {
  const navigate = useNavigate();

  // --- utente dal localStorage (salvato dopo il login) ---
  const user: User | null = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }, []);

  // se non loggato → al login
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  // --- stato UI ---
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  // --- dati per select ---
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);

  // --- form ---
  const [form, setForm] = useState<FormState>(() => ({
    data: new Date().toISOString().slice(0, 10),
    ora: new Date().toTimeString().slice(0, 5),
    categoria_id: "",
    descrizione: "",
    // per admin sarà mostrato e modificabile; per operatore resta nascosto
    cliente_id: "",
  }));

  function onChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // --- carica categorie (e clienti se admin) ---
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const cats = await api.listCategorie();
        if (alive) setCategorie(cats || []);

        if (user?.ruolo === "admin") {
          const cls = await api.listClienti?.();
          if (alive && Array.isArray(cls)) setClienti(cls);
        }
      } catch (e: any) {
        if (alive) setError(e?.message || "Errore di caricamento");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- invio form ---
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);

    // validazioni minime
    if (!form.categoria_id) {
      setError("Seleziona una categoria.");
      return;
    }
    if (!form.descrizione.trim()) {
      setError("Inserisci una descrizione.");
      return;
    }

    // determina cliente_id
    const cliente_id_finale =
      user?.ruolo === "admin"
        ? Number(form.cliente_id || 0) || null
        : user?.cliente_id ?? null;

    if (user?.ruolo === "admin" && !cliente_id_finale) {
      setError("Seleziona un cliente.");
      return;
    }

    const payload = {
      data: form.data,
      ora: form.ora,
      descrizione: form.descrizione.trim(),
      categoria_id: Number(form.categoria_id),
      cliente_id: cliente_id_finale,
    };

    setSubmitting(true);
    try {
      await api.createSegnalazione(payload);
      setOkMsg("Segnalazione salvata con successo.");
      // reset descrizione, mantieni data/ora per inserimenti rapidi
      setForm((f) => ({ ...f, descrizione: "" }));
    } catch (e: any) {
      setError(e?.message || "Errore durante il salvataggio.");
    } finally {
      setSubmitting(false);
    }
  }

  // --- UI ---
  return (
    <div className="page page--center">
      <div className="card card--md">
        <h1 className="card__title">Nuova Segnalazione</h1>

        {loading ? (
          <p className="text-dim">Caricamento…</p>
        ) : (
          <>
            {error && <div className="alert alert--error">{error}</div>}
            {okMsg && <div className="alert alert--ok">{okMsg}</div>}

            <form onSubmit={onSubmit} className="form grid-2">
              <div className="form__group">
                <label className="form__label">Data</label>
                <input
                  type="date"
                  className="input"
                  value={form.data}
                  onChange={(e) => onChange("data", e.target.value)}
                  required
                />
              </div>

              <div className="form__group">
                <label className="form__label">Ora</label>
                <input
                  type="time"
                  className="input"
                  value={form.ora}
                  onChange={(e) => onChange("ora", e.target.value)}
                  required
                />
              </div>

              <div className="form__group form__group--full">
                <label className="form__label">Categoria</label>
                <select
                  className="input"
                  value={form.categoria_id}
                  onChange={(e) => onChange("categoria_id", e.target.value)}
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

              {user?.ruolo === "admin" && (
                <div className="form__group form__group--full">
                  <label className="form__label">Cliente</label>
                  <select
                    className="input"
                    value={form.cliente_id}
                    onChange={(e) => onChange("cliente_id", e.target.value)}
                    required
                  >
                    <option value="">— Seleziona —</option>
                    {clienti.map((cl) => (
                      <option key={cl.id} value={cl.id}>
                        {cl.ragione_sociale || cl.nome || cl.email || `Cliente #${cl.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form__group form__group--full">
                <label className="form__label">Descrizione</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Descrivi la segnalazione…"
                  value={form.descrizione}
                  onChange={(e) => onChange("descrizione", e.target.value)}
                  required
                />
              </div>

              <div className="form__actions">
                <button className="btn btn--ghost" type="button" onClick={() => navigate(-1)} disabled={submitting}>
                  Annulla
                </button>
                <button className="btn" type="submit" disabled={submitting}>
                  {submitting ? "Salvataggio…" : "Salva segnalazione"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

/* 
NOTE STILE (coerenti con il tuo dark minimale):
- .page.page--center: flex, min-height: 100vh, centra contenuto
- .card.card--md: width: 100%; max-width: 720px; padding var(--space-4)
- .card__title: font-size: 1.375rem; margin-bottom: var(--space-3)
- .grid-2: grid con 2 colonne su desktop, 1 su mobile
- .form__group--full: grid-column: 1 / -1
- .input: border-radius, background scuro, testo chiaro
- .btn, .btn--ghost: pulsanti primary/ghost
- .alert--error / .alert--ok: banner messaggi
Se non li hai già nel tuo styles.css, dimmelo e ti passo subito i CSS minimi.
*/
