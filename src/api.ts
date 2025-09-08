// src/api.ts
// Wrapper minimale su fetch con baseURL da VITE_API_BASE_URL
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

function joinUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${p}`;
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = joinUrl(path);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  // Se hai un token salvato (in futuro), allegalo in automatico
  const token = localStorage.getItem("token");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers, credentials: "omit" });

  // Proviamo a leggere JSON comunque (se possibile) per avere errori più utili
  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `API error ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}
