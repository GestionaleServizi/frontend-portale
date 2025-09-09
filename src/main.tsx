// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login.tsx";
import Segnalazione from "./pages/Segnalazione.tsx"; // la tua pagina form
import DashboardAdmin from "./pages/DashboardAdmin.tsx";

import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminRoute from "./components/AdminRoute.tsx";

import "./index.css";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/segnalazione",
    element: (
      <ProtectedRoute>
        <Segnalazione />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <DashboardAdmin />
      </AdminRoute>
    ),
  },
  { path: "*", element: <Login /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
