// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      // sicurezza di base: controlla che ci sia il token
      if (!res?.token) {
        throw new Error("invalid token");
      }

      // salva dati sessione
      localStorage.setItem("token", res.token);
      localStorage.setItem("email", res.email || email.trim());
      localStorage.setItem("role", res.role || "");

      // routing per ruolo
      if ((res.role || "").toLowerCase() === "admin") {
        nav("/dashboard", { replace: true });
      } else {
        nav("/segnalazione", { replace: true });
      }
    } catch (e: any) {
      // pulizia token in caso di errore
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      setErr(e?.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* TITOLO/HEADER: lascia il tuo markup/stili qui se li avevi */}
      <h2>Login</h2>

      {/* FORM: mantieni pure le tue classi/stili esistenti */}
      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Accesso..." : "Accedi"}
        </button>

        {/* messaggio di errore minimale (puoi stilizzarlo con le tue classi) */}
        {err && <div style={{ color: "red", marginTop: 8 }}>{err}</div>}
      </form>
    </div>
  );
}
