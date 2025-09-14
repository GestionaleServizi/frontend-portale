// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione";
import UtentiPage from "./pages/UtentiPage";
import CategoriePage from "./pages/CategoriePage";
import ClientiPage from "./pages/ClientiPage";
import ProtectedRoute from "./components/ProtectedRoute"; 
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Admin */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute ruolo="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/utenti"
            element={
              <ProtectedRoute ruolo="admin">
                <UtentiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clienti"
            element={
              <ProtectedRoute ruolo="admin">
                <ClientiPage />
              </ProtectedRoute>
            }
          />

          {/* Categorie: accesso a entrambi */}
          <Route
            path="/categorie"
            element={
              <ProtectedRoute ruolo="any">
                <CategoriePage />
              </ProtectedRoute>
            }
          />

          {/* Operatore */}
          <Route
            path="/segnalazioni"
            element={
              <ProtectedRoute ruolo="operatore">
                <Segnalazione />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
