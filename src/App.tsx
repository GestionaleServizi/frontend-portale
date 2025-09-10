import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import ClientiPage from "./pages/ClientiPage";
import CategoriePage from "./pages/CategoriePage";
import UtentiPage from "./pages/UtentiPage";
import Segnalazione from "./pages/Segnalazione";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard Admin */}
        <Route path="/dashboard" element={<DashboardAdmin />} />

        {/* Gestione anagrafiche */}
        <Route path="/clienti" element={<ClientiPage />} />
        <Route path="/categorie" element={<CategoriePage />} />
        <Route path="/utenti" element={<UtentiPage />} />

        {/* Operatori → inserimento segnalazioni */}
        <Route path="/segnalazione" element={<Segnalazione />} />

        {/* Redirect default → login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

