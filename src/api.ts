export const API_BASE = import.meta.env.VITE_API_BASE_URL; // deve finire con /api

export function getToken() {
  return localStorage.getItem("token");
}
export function getRole() {
  return localStorage.getItem("ruolo");
}

export async function apiFetch(path: string, init?: RequestInit) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    // token non valido / scaduto -> forzo logout client-side
    localStorage.removeItem("token");
    localStorage.removeItem("ruolo");
  }

  if (!res.ok) {
    const msg = (await res.text().catch(() => "")) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}
