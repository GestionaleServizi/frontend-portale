// src/lib/api.ts
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

if (!BASE_URL) {
  // fallisce in modo visibile se manca la variabile su Railway
  console.error('Missing VITE_API_BASE_URL');
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`; // path parte SEMPRE con "/..." in minuscolo
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} – ${text}`);
  }
  return res.json() as Promise<T>;
}
