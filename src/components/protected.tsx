import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, isAdmin } from "../auth";

export function Protected({ children }: { children: JSX.Element }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export function AdminOnly({ children }: { children: JSX.Element }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return isAdmin() ? children : <Navigate to="/" replace />;
}
