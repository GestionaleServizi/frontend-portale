// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) {
    // niente token → vai a login
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
