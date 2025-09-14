import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: JSX.Element;
  ruolo?: "admin" | "operatore"; // opzionale, se vuoi controllare i ruoli
}

export default function ProtectedRoute({ children, ruolo }: ProtectedRouteProps) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (ruolo && user?.ruolo !== ruolo) {
    return <Navigate to="/" replace />;
  }

  return children;
}
