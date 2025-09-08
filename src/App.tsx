import { Outlet, Navigate, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";

function Protected() {
  const token = localStorage.getItem("token");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}

export default function AppLayout() {
  // La NavBar decide da sola se mostrarsi o no (in base al token)
  return (
    <div className="app-shell">
      <NavBar />
      <div className="page-body">
        <Outlet />
      </div>
    </div>
  );
}

export { Protected };
