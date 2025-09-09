import React from "react";
import { Link } from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pannello Admin</h1>
      <ul className="space-y-2">
        <li>
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            📊 Dashboard Segnalazioni
          </Link>
        </li>
        <li>
          <Link to="/clienti" className="text-blue-600 hover:underline">
            🏢 Gestione Clienti
          </Link>
        </li>
        <li>
          <Link to="/categorie" className="text-blue-600 hover:underline">
            🗂 Gestione Categorie
          </Link>
        </li>
      </ul>
    </div>
  );
}
