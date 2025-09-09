import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";

import "./styles.css";

import Login from "./pages/Login";
import Segnalazione from "./pages/Segnalazione";          // la tua pagina form
import DashboardAdmin from "./pages/DashboardAdmin";       // admin
import ProtectedRoute, { getToken } from "./components/ProtectedRoute";

function AppLayout() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

// opzionale: redirect dalla root in base alla presenza del token
function IndexRedirect() {
  const hasToken = !!getToken();
  return <Navigate to={hasToken ? "/segnalazione" : "/login"} replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <IndexRedirect /> },

      // LOGIN: deve essere SOLO la pagina di login
      { path: "/login", element: <Login /> },

      // PAGINE PROTETTE
      {
        path: "/segnalazione",
        element: (
          <ProtectedRoute>
            <Segnalazione />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardAdmin />
          </ProtectedRoute>
        ),
      },

      // 404
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

