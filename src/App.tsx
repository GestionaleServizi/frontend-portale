import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Welcome from "./pages/Welcome";
import Segnalazione from "./pages/Segnalazione";
import AdminPage from "./pages/AdminPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import ClientiPage from "./pages/ClientiPage";
import CategoriePage from "./pages/CategoriePage";
import ErrorBoundary from "./ErrorBoundary"; // 👉 nuovo import

// Protected route semplice
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Protected route solo admin
function AdminRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) return <Navigate to="/login" replace />;

  const parsed = JSON.parse(user);
  if (parsed.ruolo !== "admin") return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Welcome />} />

          {/* Operatore */}
          <Route
            path="/segnalazione"
            element={
              <ProtectedRoute>
                <Segnalazione />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <DashboardAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/clienti"
            element={
              <AdminRoute>
                <ClientiPage />
              </AdminRoute>
            }
          />
          <Route
            path="/categorie"
            element={
              <AdminRoute>
                <CategoriePage />
              </AdminRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
