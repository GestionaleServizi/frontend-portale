import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import SegnalazioneOperatore from "./pages/SegnalazioneOperatore"; // 👈 nuova pagina
import Utenti from "./pages/Utenti";
import Categorie from "./pages/Categorie";
import Clienti from "./pages/Clienti";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function PrivateRoute({ children, ruolo }: { children: JSX.Element; ruolo?: string }) {
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

          {/* Dashboard Admin */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute ruolo="admin">
                <DashboardAdmin />
              </PrivateRoute>
            }
          />

          {/* Segnalazioni Operatore */}
          <Route
            path="/segnalazioni-operatore"
            element={
              <PrivateRoute ruolo="operatore">
                <SegnalazioneOperatore />
              </PrivateRoute>
            }
          />

          {/* Gestione admin */}
          <Route
            path="/utenti"
            element={
              <PrivateRoute ruolo="admin">
                <Utenti />
              </PrivateRoute>
            }
          />
          <Route
            path="/categorie"
            element={
              <PrivateRoute ruolo="admin">
                <Categorie />
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
