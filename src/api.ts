const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Helper per gestire richieste con token
async function request(path: string, options: RequestInit = {}, auth = true) {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }

  if (res.status === 204) return null; // DELETE senza body
  return res.json();
}

// =========================
// AUTH
// =========================
export async function login(email: string, password: string) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }, false);
}

// =========================
// CATEGORIE
// =========================
export async function getCategorie() {
  return request("/categorie", { method: "GET" });
}

export async function createCategoria(nome_categoria: string) {
  return request("/categorie", {
    method: "POST",
    body: JSON.stringify({ nome_categoria }),
  });
}

export async function updateCategoria(id: number, nome_categoria: string) {
  return request(`/categorie/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nome_categoria }),
  });
}

export async function deleteCategoria(id: number) {
  return request(`/categorie/${id}`, { method: "DELETE" });
}

// =========================
// CLIENTI
// =========================
export async function getClienti() {
  return request("/clienti", { method: "GET" });
}

export async function createCliente(data: {
  nome_sala: string;
  codice_sala: string;
  email?: string;
  referente?: string;
  telefono?: string;
}) {
  return request("/clienti", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCliente(id: number, data: {
  nome_sala: string;
  email?: string;
  referente?: string;
  telefono?: string;
}) {
  return request(`/clienti/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// =========================
// SEGNALAZIONI
// =========================
export async function getSegnalazioni() {
  return request("/segnalazioni", { method: "GET" });
}

export async function createSegnalazione(data: {
  data: string;
  ora: string;
  descrizione?: string;
  categoria_id: number;
}) {
  return request("/segnalazioni", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSegnalazione(id: number, data: {
  data: string;
  ora: string;
  descrizione?: string;
  categoria_id: number;
  cliente_id: number;
}) {
  return request(`/segnalazioni/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSegnalazione(id: number) {
  return request(`/segnalazioni/${id}`, { method: "DELETE" });
}
