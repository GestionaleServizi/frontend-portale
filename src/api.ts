// src/api.ts
// Wrapper minimale per chiamate al backend + funzioni di dominio.

const BASE = import.meta.env.VITE_API_BASE_URL; // es. https://segnalazioni-backend-production.up.railway.app/api

if (!BASE) {
  // Aiuta a debug se dimentichiamo la variabile in Railway
  // (non rompere il build: solo console.error)
  // eslint-disable-next-line no-console
  console.error("VITE_API_BASE_URL mancante!");
}

// --- Token helpers ---
export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setAuth(token: string, role: string, email: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("email", email);
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
}

// --- HTTP helper ---
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body,
    credentials: "omit",
  });

  // Se la risposta non è JSON (es. 404 HTML), proviamo a leggere testo per messaggio
  const isJson =
    res.headers.get("content-type")?.toLowerCase().includes("application/json") ?? false;

  if (!res.ok) {
    const msg = isJson ? (await res.json())?.error ?? res.statusText : await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return (isJson ? await res.json() : ({} as T)) as T;
}

// --- API specifiche ---

// Login: POST /auth/login  -> { token, user: { ruolo, email, ... } }
export async function loginApi(email: string, password: string): Promise<{
  token: string;
  user: { ruolo: string; email: string };
}> {
  const data = await request<{ token: string; user: { ruolo: string; email: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }
  );
  return data;
}

// GET /categorie -> Array<{ id: number; nome_categoria: string }>
export async function getCategorie(): Promise<Array<{ id: number; nome_categoria: string }>> {
  return request("/categorie");
}

// POST /segnalazioni
export async function createSegnalazione(payload: {
  data: string; // ISO yyyy-mm-dd
  ora: string;  // HH:mm
  categoria_id: number;
  descrizione: string;
}): Promise<{ id: number }> {
  return request("/segnalazioni", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
