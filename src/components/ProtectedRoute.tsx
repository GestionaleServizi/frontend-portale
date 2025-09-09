import React from "react";
import { Navigate } from "react-router-dom";

export function getToken() {
  return localStorage.getItem("token");
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
