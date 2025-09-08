// src/api.ts
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Errore login: ${res.status}`);
  }

  return res.json();
}
