// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Login from "./pages/Login.tsx";
import Segnalazione from "./pages/Segnalazione.tsx";
import DashboardAdmin from "./pages/DashboardAdmin.tsx";

import ProtectedRoute from "./components/ProtectedRoute.tsx";
import "./styles.css"; // o index.css

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
      <ProtectedRoute>
        <DashboardAdmin />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <Login /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
