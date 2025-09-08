import { Link } from "react-router-dom";

export default function NavBar() {
  const isAuthed = !!localStorage.getItem("token");
  if (!isAuthed) return null; // nasconde la navbar finché non si è loggati

  return (
    <nav className="topbar">
      <div className="brand">
        <img src="/logo" alt="logo" />
      </div>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/clienti">Clienti</Link></li>
        <li><Link to="/segnalazione">Segnalazione</Link></li>
        <li>
          <button
            className="logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}
