// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await login(email, password);

      if (res.ok && res.user) {
        // Salva i dati in localStorage
        localStorage.setItem("token", res.token || ""); // se non c'è token, stringa vuota
        localStorage.setItem("email", res.user.email);
        localStorage.setItem("role", res.user.ruolo);

        // Redirect in base al ruolo
        if (res.user.ruolo === "admin") {
          nav("/dashboard");
        } else {
          nav("/segnalazione");
        }
      } else {
        setError(res.error || "Credenziali non valide");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Errore durante il login");
    }
  }

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Accedi</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
