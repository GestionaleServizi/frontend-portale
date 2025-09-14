// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione"; // unica pagina per operatori
import Utenti from "./pages/UtentiPage";
import Categorie from "./pages/CategoriePage";
import Clienti from "./pages/ClientiPage";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function PrivateRoute({
  children,
  ruolo,
}: {
  children: JSX.Element;
  ruolo: string;
}) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/" replace />;
  if (ruolo && user?.ruolo !== ruolo) return <Navigate to="/" replace />;
  return children;
}

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
              <PrivateRoute ruolo="admin">
                <DashboardAdmin />
              </PrivateRoute>
            }
          />
          <Route
            path="/utenti"
            element={
              <PrivateRoute ruolo="admin">
                <Utenti />
              </PrivateRoute>
            }
          />
          <Route
            path="/clienti"
            element={
              <PrivateRoute ruolo="admin">
                <Clienti />
              </PrivateRoute>
            }
          />

          {/* Categorie - accessibile a entrambi */}
          <Route
            path="/categorie"
            element={
              <PrivateRoute ruolo={user?.ruolo === "admin" ? "admin" : "operatore"}>
                <Categorie />
              </PrivateRoute>
            }
          />

          {/* Operatore */}
          <Route
            path="/segnalazioni"
            element={
              <PrivateRoute ruolo="operatore">
                <Segnalazione />
              </PrivateRoute>
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
