// src/api.ts
const BASE = import.meta.env.VITE_API_BASE_URL; 
// es. https://segnalazioni-backend-production.up.railway.app/api

import { getToken } from "./auth";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  // 🔐 AUTH
  login(email: string, password: string) {
    return request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // 📂 CATEGORIE
  listCategorie() {
    return request<Array<{ id: number; nome_categoria: string }>>("/categorie");
  },
  createCategoria(nome_categoria: string) {
    return request("/categorie", {
      method: "POST",
      body: JSON.stringify({ nome_categoria }),
    });
  },
  deleteCategoria(id: number) {
    return request(`/categorie/${id}`, { method: "DELETE" });
  },

  // 👥 CLIENTI
  listClienti() {
    return request<any[]>("/clienti");
  },
  upsertCliente(payload: any) {
    return request("/clienti", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // 📝 SEGNALAZIONI
  listSegnalazioni() {
    return request<any[]>("/segnalazioni");
  },
  createSegnalazione(payload: any) {
    return request("/segnalazioni", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
