import { useState } from "react";
import { api } from "../lib/api"; // usa l'istanza Axios con baseURL e Authorization

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      // chiamata corretta: /api/auth/login
      const res = await api.post("/auth/login", { email, password });

      // ci aspettiamo: { token, user: {...} }
      const { token } = res.data || {};
      if (!token) {
        setErr("Risposta non valida dal server.");
        return;
      }

      localStorage.setItem("token", token);
      // opzionale: salva info utente se il backend le invia
      // localStorage.setItem("user", JSON.stringify(res.data.user));

      // redirect semplice dopo il login
      window.location.href = "/dashboard";
    } catch (e: any) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Errore sconosciuto";

      if (status) setErr(`HTTP ${status}: ${msg}`);
      else setErr(`Network error: ${msg}`);
    }
  }

  return (
    <div className="grid" style={{ placeItems: "center", minHeight: "60vh" }}>
      <div className="card" style={{ maxWidth: 420, width: "100%" }}>
        <h2>Login</h2>
        <form onSubmit={submit} className="grid" style={{ gap: 12 }}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {err && (
            <div style={{ color: "red", fontWeight: 600 }}>
              {err}
            </div>
          )}
          <button type="submit">Accedi</button>
        </form>
      </div>
    </div>
  );
}
