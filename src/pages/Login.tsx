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
      // >>> SALVATAGGIO COERENTE <<<
      localStorage.setItem("token", res.token);
      localStorage.setItem("email", res.user.email);
      localStorage.setItem("role", res.user.ruolo);

      // redirect in base al ruolo
      if (res.user.ruolo === "admin") {
        nav("/dashboard");
      } else {
        nav("/segnalazione");
      }
    } catch (e: any) {
      setErr(e?.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: 360,
          padding: 24,
          borderRadius: 12,
          border: "1px solid #2b2f36",
          background: "#0f172a",
          color: "#e2e8f0",
        }}
      >
        <h1 style={{ margin: "0 0 16px 0", fontSize: 22 }}>Login</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 16 }}
          required
        />

        {err && (
          <div style={{ color: "#f87171", marginBottom: 12 }}>{err}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            background: "#2563eb",
            border: "none",
            color: "white",
            borderRadius: 8,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
