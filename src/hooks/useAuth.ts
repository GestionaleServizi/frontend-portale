import { useMemo } from "react";

type User = {
  id: number;
  email: string;
  ruolo: "admin" | "operatore";
  cliente_id?: number | null;
};

export function useAuth() {
  const user: User | null = useMemo(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  }, []);

  const token = useMemo(() => {
    return localStorage.getItem("token");
  }, []);

  return { user, token };
}

