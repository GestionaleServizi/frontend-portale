// src/hooks/useAuth.ts
import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  id: number;
  email: string;
  ruolo: "admin" | "operatore";
  cliente_id?: number | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // 🔄 Recupera user/token da localStorage al refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  // 🔑 Login
  const login = async (email: string, password: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Credenziali non valide");

    const data = await res.json();
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);

    return data.user;
  };

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 🎣 Hook personalizzato
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider");
  }
  return context;
}
