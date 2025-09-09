// src/api.ts
const BASE = import.meta.env.VITE_API_BASE_URL;

// Recupera il token salvato
export function getToken(): string | null {
  return localStorage.getItem("token");
}

// Funzione generica per chiamate API con token
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<T>;
}

// =======================
// AUTH
// =======================
export async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

// =======================
// CATEGORIE
// =======================
export async function getCategorie(): Promise<Array<{ id: number; nome_categoria: string }>> {
  return request("/categorie");
}

export async function createCategoria(nome_categoria: string) {
  return request("/categorie", {
    method: "POST",
    body: JSON.stringify({ nome_categoria }),
  });
}

export async function deleteCategoria(id: number) {
  return request(`/categorie/${id}`, { method: "DELETE" });
}

// =======================
// CLIENTI (solo admin)
// =======================
export async function listClienti() {
  return request("/clienti");
}

export async function upsertCliente(payload: any) {
  return request("/clienti", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// =======================
// SEGNALAZIONI
// =======================
export async function listSegnalazioni() {
  return request("/segnalazioni");
}

export async function createSegnalazione(payload: any) {
  return request("/segnalazioni", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
