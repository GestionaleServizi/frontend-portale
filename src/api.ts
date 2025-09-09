// src/api.ts
// Helper centralizzato per chiamate API + gestione auth nel localStorage

type Json = Record<string, any>;

export type Categoria = { id: number; nome_categoria: string };

const BASE = import.meta.env.VITE_API_BASE_URL; // deve includere già /api

// --- Storage helpers ---
const LS = {
  token: "token",
  role: "role",
  email: "email",
  clientId: "clientId",
};

export function getToken(): string | null {
  return localStorage.getItem(LS.token);
}
export function getRole(): string | null {
  return localStorage.getItem(LS.role);
}
export function getEmail(): string | null {
  return localStorage.getItem(LS.email);
}
export function getClientId(): string | null {
  return localStorage.getItem(LS.clientId);
}
export function isLoggedIn(): boolean {
  return !!getToken();
}
export function logout(): void {
  localStorage.removeItem(LS.token);
  localStorage.removeItem(LS.role);
  localStorage.removeItem(LS.email);
  localStorage.removeItem(LS.clientId);
}

// --- HTTP helper ---
async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  if (!BASE) throw new Error("Config mancante: VITE_API_BASE_URL");

  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });

  // Se 401 → forzo logout
  if (res.status === 401) {
    try {
      const err = await res.json().catch(() => ({}));
      console.warn("401 dal backend:", err);
    } finally {
      logout();
    }
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} - ${txt || "Errore richiesta"}`);
  }

  // json safe
  const data = (await res.json().catch(() => ({}))) as T;
  return data;
}

// --- AUTH ---
export async function login(email: string, password: string): Promise<void> {
  const data = await request<Json>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // backend può restituire token in vari campi: normalizziamo
  const token: string | undefined =
    data.token ?? data.accessToken ?? data.jwt ?? data?.user?.token;

  if (!token) {
    // niente token = niente aree protette
    throw new Error("Login eseguito ma nessun token ricevuto dal server");
  }

  // user info opzionali
  const ruolo: string | undefined = data.user?.ruolo ?? data.role;
  const emailNorm: string | undefined = data.user?.email ?? email;
  const clientId: string | undefined =
    data.user?.clienteId ?? data.user?.cliente_id ?? data.clientId;

  localStorage.setItem(LS.token, token);
  if (ruolo) localStorage.setItem(LS.role, ruolo);
  if (emailNorm) localStorage.setItem(LS.email, emailNorm);
  if (clientId) localStorage.setItem(LS.clientId, String(clientId));
}

// --- CATEGORIE ---
export async function getCategorie(): Promise<Categoria[]> {
  const data = await request<Categoria[]>("/categorie");
  return data;
}

// --- SEGNALAZIONI ---
export async function createSegnalazione(payload: {
  data: string; // yyyy-mm-dd
  ora: string; // HH:mm
  categoria_id: number;
  descrizione: string;
}): Promise<{ ok: boolean; id?: number }> {
  const data = await request<{ ok: boolean; id?: number }>("/segnalazioni", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export default {
  login,
  logout,
  isLoggedIn,
  getToken,
  getRole,
  getEmail,
  getClientId,
  getCategorie,
  createSegnalazione,
};
