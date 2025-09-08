export type User = {
  id: number;
  email: string;
  ruolo: "admin" | "cliente";
  clienteId?: number | null;
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? (JSON.parse(raw) as User) : null; } catch { return null; }
}

export function isLoggedIn() {
  return !!getToken();
}

export function isAdmin() {
  return getUser()?.ruolo === "admin";
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  location.href = "/login";
}
