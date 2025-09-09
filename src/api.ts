// src/api.ts
const BASE = import.meta.env.VITE_API_BASE_URL; // es: https://segnalazioni-backend-.../api

function getToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  // prova a leggere testo per dare messaggi utili
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    let msg = text || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text);
      msg = j.error || j.message || msg;
    } catch {}
    throw new Error(msg);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    // se non è json, prova a castare (utile in dev)
    return text as unknown as T;
  }
}

export type LoginResponse = {
  token: string;
  user: { email: string; ruolo: "admin" | "operatore" };
};

export const api = {
  // AUTH
  async login(email: string, password: string) {
    return request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // CATEGORIE
  listCategorie() {
    return request<Array<{ id: number; nome_categoria: string }>>("/categorie");
  },

  // SEGNALAZIONI
  createSegnalazione(payload: {
    data: string; // YYYY-MM-DD
    ora: string;  // HH:mm
    categoria_id: number;
    descrizione?: string;
  }) {
    return request<{ id: number }>("/segnalazioni", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
