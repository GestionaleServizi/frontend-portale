// src/api.ts
// Helper API centralizzato: evita doppio /api, aggiunge Authorization se presente

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type JsonRecord = Record<string, any>;

const RAW_BASE = import.meta.env.VITE_API_BASE_URL ?? ""; 
// Esempio consigliato: https://segnalazioni-backend-production.up.railway.app/api
// Va bene anche senza /api, l'unione sotto è "safe".

function joinUrl(base: string, path: string) {
  const b = base.replace(/\/+$/, "");      // rimuove / finali
  const p = path.replace(/^\/+/, "");      // rimuove / iniziali
  return `${b}/${p}`;
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}
export function getRole(): string | null {
  return localStorage.getItem("role");
}
export function getEmail(): string | null {
  return localStorage.getItem("email");
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = joinUrl(RAW_BASE, path);
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, { ...options, headers });

  // 401/403: forza logout chiaro lato chiamante
  if (res.status === 401 || res.status === 403) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "unauthorized");
  }

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }

  // alcune route possono rispondere 204
  if (res.status === 204) return undefined as unknown as T;

  return (await res.json()) as T;
}

/* ===================== AUTH ===================== */

type LoginResp =
  | { ok: true; token?: string; user: { id: number; email: string; ruolo: string; clienteId?: number | null } }
  | { error: string };

export async function login(email: string, password: string): Promise<void> {
  const data = await request<LoginResp>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if ("error" in data) throw new Error(data.error || "invalid credentials");

  // salva dati base
  localStorage.setItem("email", data.user.email);
  localStorage.setItem("role", data.user.ruolo);

  // token potrebbe non esserci (modalità “test in chiaro”). In quel caso azzeriamo comunque.
  if (data.token) {
    localStorage.setItem("token", data.token);
  } else {
    localStorage.removeItem("token");
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}

/* ===================== CATEGORIE ===================== */

export type Categoria = { id: number; nome_categoria: string };

export async function getCategorie(): Promise<Categoria[]> {
  const raw = await request<any>("/categorie");
  // backend può restituire direttamente un array oppure { rows: [...] }
  if (Array.isArray(raw)) return raw as Categoria[];
  if (raw && Array.isArray(raw.rows)) return raw.rows as Categoria[];
  return [];
}

/* ===================== SEGNALAZIONI ===================== */

export type CreateSegnalazionePayload = {
  data: string;      // YYYY-MM-DD
  ora: string;       // HH:mm
  categoria_id: number;
  descrizione: string;
};

export async function createSegnalazione(payload: CreateSegnalazionePayload): Promise<{ ok: true }> {
  return await request<{ ok: true }>("/segnalazioni", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export default {
  login,
  logout,
  getToken,
  getRole,
  getEmail,
  getCategorie,
  createSegnalazione,
};
