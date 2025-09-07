import React, { useState } from "react";
import { api } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      // IMPORTANTISSIMO: endpoint minuscolo
      const data = await api<{ token: string; ruolo: "admin" | "utente" }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Salva token per le chiamate successive
      localStorage.setItem("token", data.token);

      // redirect semplice (se vuoi)
      window.location.href = data.ruolo === "admin" ? "/dashboard" : "/segnalazione";
    } catch (e: any) {
      setErr(e.message ?? "Login fallito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Login</h2>
      <form onSubmit={submit} className="grid">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        {err && <div style={{ color: "red" }}>{err}</div>}
        <button type="submit" disabled={loading}>{loading ? "Attendere..." : "Accedi"}</button>
      </form>
    </div>
  );
}
