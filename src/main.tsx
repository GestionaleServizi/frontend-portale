import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react"; // 👉 aggiunto

import "./styles.css";
import Login from "./pages/Login";
import Dashboard from "./pages/DashboardAdmin";
import Segnalazione from "./pages/Segnalazione";

function isAuth() {
  try {
    return !!localStorage.getItem("token");
  } catch {
    return false;
  }
}

function AppLayout() {
  // mostra header solo se autenticato
  const authed = isAuth();
  return (
    <div className="app">
      {authed && (
        <header className="nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/segnalazione">Segnalazione</a>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </header>
      )}
      <Outlet />
    </div>
  );
}

function Protected() {
  return isAuth() ? <Outlet /> : <Navigate to="/login" replace />;
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
          { path: "/segnalazione", element: <Segnalazione /> },
        ],
      },
      { path: "*", element: <div>404</div> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  </React.StrictMode>
);
