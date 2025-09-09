// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const raw = localStorage.getItem("user");
  if (!raw) return <Navigate to="/login" replace />;

  try {
    const u = JSON.parse(raw);
    if (!u?.id) return <Navigate to="/login" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
