// src/api.ts
// Wrapper API per il frontend (Vite + TS)
// - salva/legge il token dal localStorage
// - aggiunge automaticamente Authorization: Bearer <token>
// - normalizza la BASE_URL da import.meta.env.VITE_API_BASE_URL

/* =======================
 *  CONFIG & STORAGE
 * ======================= */
const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (!RAW_BASE) {
  // Preferisco dare un errore chiaro già all'avvio del bundle
  // così evitiamo "Failed to fetch" misteriosi.
  // Ricorda di valorizzare VITE_API_BASE_URL su Railway (frontend) e .env.
  throw new Error("Config mancante: VITE_API_BASE_URL");
}

// normalizza: niente slash finale
const BASE = RAW_BASE.replace(/\/+$/, "");

// chiavi usate nello storage
const LS_TOKEN = "token";
const LS_EMAIL = "email";
const LS_ROLE  = "role";

/* =======================
 *  TIPI
 * ======================= */
export type Ruolo = "admin" | "operatore" | "cliente";
export type JwtUser = {
  id: number;
  email: string;
  ruolo: Ruolo;
  clienteId: number | null;
};

export type Categoria = {
  id: number;
  nome_categoria: string;
};

export type SegnalazionePayload = {
  data: string;              // "YYYY-MM-DD"
  ora: string;               // "HH:mm"
  categoria_id: number | "";
  descrizione: string;
};

/* =======================
 *  STORAGE HELPERS
 * ======================= */
export function getToken(): string | null {
  return localStorage.getItem(LS_TOKEN);
}
export function getEmail(): string | null {
  return localStorage.getItem(LS_EMAIL);
}
export function getRole(): Ruolo | null {
  const v = localStorage.getItem(LS_ROLE);
  return (v === "admin" || v === "operatore" || v === "cliente") ? v : null;
}

function setAuth(token: string, user: JwtUser) {
  localStorage.setItem(LS_TOKEN, token);
  localStorage.setItem(LS_EMAIL, user.email);
  localStorage.setItem(LS_ROLE, user.ruolo);
}

export function clearAuth() {
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_EMAIL);
  localStorage.removeItem(LS_ROLE);
}

/* =======================
 *  REQUEST WRAPPER
 * ======================= */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path.startsWith("/") ? "" : "/"}${path}`, {
    ...init,
    headers,
  });

  // se la risposta è 401/403 pulisco l'auth per evitare stati incoerenti
  if (res.status === 401 || res.status === 403) {
    // prova a leggere eventuale messaggio
    let msg = "unauthorized";
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore json parse */
    }
    throw new Error(msg); // lascio gestire al chiamante (es. redirect al /login)
  }

  if (!res.ok) {
    // restituisco l’errore del server se presente
    const text = await res.text().catch(() => "");
    let message = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      if (j?.error) message = j.error;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  // alcune risposte (es. DELETE 204) non hanno body
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

/* =======================
 *  API: AUTH
 * ======================= */
export async function login(email: string, password: string): Promise<{
  ok: true;
  token: string;
  user: JwtUser;
}> {
  const data = await request<{
    ok: true;
    token: string;
    user: JwtUser;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // salvo token + info utente
  setAuth(data.token, data.user);

  return data;
}

/* =======================
 *  API: CATEGORIE
 * ======================= */
export async function getCategorie(): Promise<Categoria[]> {
  // GET /categorie → [{ id, nome_categoria }]
  return await request<Categoria[]>("/categorie");
}

/* =======================
 *  API: SEGNALAZIONI
 * ======================= */
export async function createSegnalazione(payload: SegnalazionePayload): Promise<{ ok: true; id: number }> {
  // validazioni minime lato client
  if (!payload.data) throw new Error("La data è obbligatoria");
  if (!payload.ora) throw new Error("L'ora è obbligatoria");
  if (!payload.categoria_id) throw new Error("La categoria è obbligatoria");
  if (!payload.descrizione?.trim()) throw new Error("La descrizione è obbligatoria");

  return await request<{ ok: true; id: number }>("/segnalazioni", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =======================
 *  API: CLIENTI (se servono altrove)
 * ======================= */
export async function getClienti(): Promise<any[]> {
  return await request<any[]>("/clienti");
}

/* =======================
 *  UTILS
 * ======================= */
export function isLoggedIn(): boolean {
  return !!getToken();
}
