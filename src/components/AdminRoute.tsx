// src/components/AdminRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const raw = localStorage.getItem("user");
  if (!raw) return <Navigate to="/login" replace />;

  try {
    const u = JSON.parse(raw);
    if (!u?.is_admin) return <Navigate to="/segnalazione" replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
