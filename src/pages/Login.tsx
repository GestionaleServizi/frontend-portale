import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const API = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.token) {
        setErr(data?.error || "Credenziali non valide");
        return;
      }

      // salva token e user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));

      // vai alla dashboard
      window.location.href = "/dashboard";
    } catch (e) {
      setErr("Errore di rete");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Accedi</h2>

        <form onSubmit={submit} className="login-form">
          <input
            type="email"
            placeholder="es. admin@tuazienda.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
          <div className="password-row">
            <input
              type="password"
              placeholder="La tua password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {err && <div className="login-error">{err}</div>}

          <button type="submit" className="login-btn">Entra</button>
        </form>
      </div>
    </div>
  );
}

