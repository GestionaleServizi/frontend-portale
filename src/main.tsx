// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "./theme"; // ✅ tema personalizzato

import "./styles.css";
import Login from "./pages/Login";
import Dashboard from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione";
import { AuthProvider } from "./hooks/useAuth"; // 👈 importa il provider

function AppLayout() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}

function Protected() {
  // 👇 ora il controllo auth lo spostiamo su useAuth, non più sul localStorage diretto
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Navigate to="/login" replace /> },
      { path: "/login", element: <Login /> },
      {
        element: <Protected />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/segnalazioni", element: <Segnalazione /> }, // 👈 occhio al plurale, deve coincidere con App.tsx
        ],
      },
      { path: "*", element: <div>404</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      {/* 👇 Avvolgi tutta l’app dentro l’AuthProvider */}
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
);
