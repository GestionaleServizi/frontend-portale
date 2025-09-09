// src/api.ts
const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, ""); 
// Esempio corretto: https://segnalazioni-backend-production.up.railway.app/api

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getUser(): any | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export async function request<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // Se il backend risponde 401/403 → logout e redirect a /login
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    throw new Error("UNAUTHORIZED");
  }

  // Se il backend risponde HTML (es. 404 Express) evita .json() che esplode
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // se è ok ma non JSON (non dovrebbe), restituisci string
    return (await res.text()) as unknown as T;
  }

  const data = await res.json();
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

// API di comodo
export const api = {
  // AUTH
  login: (email: string, password: string) =>
    request<{ ok: true; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // CATEGORIE
  listCategorie: () => request<Array<{ id: number; nome_categoria: string }>>("/categorie"),

  // SEGNALAZIONI
  creaSegnalazione: (payload: {
    data: string; // yyyy-mm-dd
    ora: string;  // HH:mm
    categoria_id: number;
    descrizione?: string;
  }) =>
    request<{ ok: true; id: number }>("/segnalazioni", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
