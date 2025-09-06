import { Routes, Route, NavLink } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import AdminPage from "./pages/AdminPage";
import DashboardAdmin from "./pages/DashboardAdmin";
import ClientiPage from "./pages/ClientiPage";
import Segnalazione from "./pages/Segnalazione";

export default function App() {
  return (
    <div>
      <header>
        <div className="logo">
          <img src="/src/assets/logo-dark.svg" alt="logo" width={120} height={32} />
          <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/admin">Admin</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/clienti">Clienti</NavLink>
            <NavLink to="/segnalazione">Segnalazione</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardAdmin />} />
          <Route path="/clienti" element={<ClientiPage />} />
          <Route path="/segnalazione" element={<Segnalazione />} />
          <Route path="*" element={<h2>404 - Pagina non trovata</h2>} />
        </Routes>
      </main>
      <footer>
        <span className="muted">© {new Date().getFullYear()} Segnalazioni</span>
      </footer>
    </div>
  );
}
