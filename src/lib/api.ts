// src/lib/api.ts
// Wrapper fetch con baseURL da VITE_API_BASE_URL e Authorization automatica.

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const TOKEN_KEY = "authToken"; // Se usi un nome diverso, cambialo qui

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function joinUrl(path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any; // object | FormData | string | undefined
  signal?: AbortSignal;
  // se serve aggiungi: noAuth?: boolean  // per disabilitare l'header Authorization
};

async function request<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error("VITE_API_BASE_URL non è impostata. Verifica il file .env(.production) e il deploy.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout
  const signal = opts.signal || controller.signal;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.headers || {}),
  };

  // Gestione body: se è un oggetto JS non-FormData -> JSON
  let bodyToSend: BodyInit | undefined = undefined;
  const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;

  if (opts.body !== undefined) {
    if (isFormData) {
      bodyToSend = opts.body; // browser imposta boundary e content-type
    } else if (typeof opts.body === "string") {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      bodyToSend = opts.body;
    } else {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
      bodyToSend = JSON.stringify(opts.body);
    }
  }

  // Authorization automatico se esiste un token
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(joinUrl(path), {
    method: opts.method || "GET",
    headers,
    body: bodyToSend,
    signal,
  }).catch((err) => {
    clearTimeout(timeout);
    // AbortError o network error
    throw new Error(`Network error: ${err?.message || err}`);
  });

  clearTimeout(timeout);

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  // Proviamo sempre a leggere JSON, se possibile
  const text = await res.text();
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const data = isJson && text ? JSON.parse(text) : (text as any);

  if (!res.ok) {
    // Se 401, potresti voler fare logout automatico:
    // if (res.status === 401) setToken(null);
    const message =
      (data && (data.message || data.error || data.detail)) ||
      `HTTP ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data as T;
}

// Metodi comodi
export const api = {
  get: <T = any>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "GET", headers }),
  post: <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    request<T>(path, { method: "POST", body, headers }),
  put:  <T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    request<T>(path, { method: "PUT", body, headers }),
  patch:<T = any>(path: string, body?: any, headers?: Record<string, string>) =>
    request<T>(path, { method: "PATCH", body, headers }),
  delete:<T = any>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", headers }),
};

// Helper specifici (facoltativi) per auth
export async function login(email: string, password: string) {
  const res = await api.post<{ token: string }>("/api/auth/login", { email, password });
  setToken(res.token);
  return res;
}

export function logout() {
  setToken(null);
}
