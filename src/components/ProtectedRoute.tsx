// src/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

type ProtectedRouteProps = {
  children: JSX.Element;
  ruolo: "admin" | "operatore" | "any";
};

export default function ProtectedRoute({ children, ruolo }: ProtectedRouteProps) {
  const { token, user } = useAuth();

  // Se non loggato → torna al login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Se è "any" → permette l’accesso a tutti gli utenti loggati
  if (ruolo === "any") {
    return children;
  }

  // Controllo sul ruolo
  if (user.ruolo !== ruolo) {
    return <Navigate to="/" replace />;
  }

  return children;
}
