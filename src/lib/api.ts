// src/lib/api.ts

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

if (!BASE_URL) {
  console.error("⚠️ Missing VITE_API_BASE_URL in environment variables");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(init?.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }

  return res.json() as Promise<T>;
}

/* ---------- HELPER API ---------- */

export interface LoginResponse {
  token: string;
  ruolo: "admin" | "utente";
}

export async function login(email: string, password: string) {
  const data = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  localStorage.setItem("token", data.token);
  return data;
}

export async function getClienti() {
  return api<any[]>("/clienti");
}

export async function getSegnalazioni() {
  return api<any[]>("/segnalazioni");
}

export async function getCategorie() {
  return api<any[]>("/categorie");
}
