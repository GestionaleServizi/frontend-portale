const BASE = import.meta.env.VITE_API_BASE_URL; // es: https://segnalazioni-backend-production.up.railway.app/api

// 🔹 funzione per prendere il token salvato nel localStorage
export function getToken(): string | null {
  return localStorage.getItem("token");
}

// 🔹 wrapper per tutte le richieste
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    let msg = "";
    try {
      msg = await res.text();
    } catch {
      msg = res.statusText;
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// 🔹 API esportata
const api = {
  // --- AUTH ---
  login: async (email: string, password: string) => {
    return request<{ ok: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // --- CATEGORIE ---
  getCategorie: async () => {
    return request<Array<{ id: number; nome_categoria: string }>>("/categorie");
  },

  // --- CLIENTI ---
  listClienti: async () => {
    return request<Array<any>>("/clienti");
  },

  // --- SEGNALAZIONI ---
  listSegnalazioni: async () => {
    return request<Array<any>>("/segnalazioni");
  },

  createSegnalazione: async (payload: any) => {
    return request("/segnalazioni", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default api;
