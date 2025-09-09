import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import "./styles.css";

// Pagine
import Login from "./pages/Login";
import DashboardAdmin from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione";

// --- helpers storage
function getToken() {
  return localStorage.getItem("token");
}
function getRole() {
  return localStorage.getItem("ruolo");
}

// --- layout base (wrapper opzionale)
function AppLayout() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

// --- route guard: richiede token
function Protected() {
  const token = getToken();
  const loc = useLocation();
  if (!token) {
    // niente token -> vai al login
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return <Outlet />;
}

// --- solo admin
function AdminOnly() {
  const ruolo = getRole();
  if (ruolo !== "admin") {
    return <Navigate to="/segnalazione" replace />;
  }
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // root: se ho token decido dove andare, altrimenti /login
      {
        index: true,
        element: getToken() ? (
          getRole() === "admin" ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/segnalazione" replace />
          )
        ) : (
          <Navigate to="/login" replace />
        ),
      },

      { path: "/login", element: <Login /> },

      {
        element: <Protected />, // da qui in giù serve il token
        children: [
          {
            path: "/dashboard",
            element: (
              <AdminOnly>
                <DashboardAdmin />
              </AdminOnly>
            ),
          },
          { path: "/segnalazione", element: <Segnalazione /> },
        ],
      },

      // fallback
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
