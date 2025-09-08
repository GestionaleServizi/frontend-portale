// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import { isLoggedIn, isAdmin, logout, getUser } from "../auth";

export default function Header() {
  const logged = isLoggedIn();
  const user = getUser();

  return (
    <nav className="topbar">
      <img src="/logo.svg" alt="logo" height={28} />
      {logged && (
        <ul className="nav">
          <li><Link to="/">Home</Link></li>
          {isAdmin() && <li><Link to="/admin">Admin</Link></li>}
          <li><Link to="/dashboard">Dashboard</Link></li>
          {isAdmin() && <li><Link to="/clienti">Clienti</Link></li>}
          <li><Link to="/segnalazione">Segnalazione</Link></li>
        </ul>
      )}
      {logged ? (
        <div className="user">
          <span>{user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}
