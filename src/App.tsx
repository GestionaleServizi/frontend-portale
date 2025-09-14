import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione"; 
import Utenti from "./pages/Utenti";
import Categorie from "./pages/Categorie";
import Clienti from "./pages/Clienti";
import { AuthProvider, useAuth } from "./hooks/useAuth";

function PrivateRoute({ children, ruolo }: { children: JSX.Element; ruolo: string }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/" replace />;

  // 👇 Se è operatore e prova ad accedere a pagine admin → redirect a segnalazioni
  if (ruolo && user?.ruolo !== ruolo) {
    if (user?.ruolo === "operatore") {
      return <Navigate to="/segnalazione" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Dashboard Admin (solo admin) */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute ruolo="admin">
                <DashboardAdmin />
              </PrivateRoute>
            }
          />

          {/* Pagina Segnalazioni (accesso operatori e admin) */}
          <Route
            path="/segnalazione"
            element={
              <PrivateRoute ruolo="">
                <Segnalazione />
              </PrivateRoute>
            }
          />

          {/* Gestione admin (solo admin) */}
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
