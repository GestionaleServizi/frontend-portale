// src/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

export default function ProtectedRoute({
  children,
  ruolo,
}: {
  children: React.ReactNode;
  ruolo?: string; // 👈 opzionale, se non lo passi basta il token
}) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Se passo un ruolo, verifico che corrisponda
  if (ruolo && user.ruolo !== ruolo) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
