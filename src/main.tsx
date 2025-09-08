import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";

import "./styles.css"; // importa i tuoi stili globali

// Pagine
import Login from "./pages/Login";
import Dashboard from "./pages/DashboardAdmin";
import Clienti from "./pages/ClientiPage";
import Segnalazione from "./pages/Segnalazione";
import Welcome from "./pages/Welcome";

// Layout base (wrapper con <Outlet />)
function AppLayout() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

// Protezione delle route (controlla token utente)
function Protected() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/login", element: <Login /> },
      {
        element: <Protected />,
        children: [
          { path: "/", element: <Welcome /> },
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/clienti", element: <Clienti /> },
          { path: "/segnalazione", element: <Segnalazione /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
