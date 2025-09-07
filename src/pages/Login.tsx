import React, { useState } from "react";
import { login } from "../lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await login(email, password);
      window.location.href = data.ruolo === "admin" ? "/dashboard" : "/segnalazione";
    } catch (e: any) {
      setErr(e.message ?? "Errore login");
    }
  }

  return (
    <form onSubmit={submit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {err && <p style={{ color: "red" }}>{err}</p>}
      <button type="submit">Accedi</button>
    </form>
  );
}
