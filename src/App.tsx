import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione"; // pagina operatore
import Utenti from "./pages/UtentiPage";
import Categorie from "./pages/CategoriePage";
import Clienti from "./pages/ClientiPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
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
            <Utenti />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categorie"
        element={
          <ProtectedRoute ruolo="admin">
            <Categorie />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clienti"
        element={
          <ProtectedRoute ruolo="admin">
            <Clienti />
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

      {/* Not Found */}
      <Route path="*" element={<div>404 - Pagina non trovata</div>} />
    </Routes>
  );
}
