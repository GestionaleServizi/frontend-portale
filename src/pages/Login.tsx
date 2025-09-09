// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi, setAuth, clearAuth } from "../api";

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
      const { token, user } = await loginApi(email.trim(), password);
      // salva token/ruolo/email
      setAuth(token, user.ruolo, user.email);

      // routing basato sul ruolo
      if (user.ruolo === "admin") {
        nav("/dashboard", { replace: true });
      } else {
        // operatore o qualsiasi altro ruolo va alla pagina segnalazione
        nav("/segnalazione", { replace: true });
      }
    } catch (e: any) {
      clearAuth();
      setErr(e?.message || "Credenziali non valide");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page page-login">
      <h1>Login</h1>

      <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420 }}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        {err && <div className="error">{err}</div>}

        <button disabled={loading} type="submit">
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
