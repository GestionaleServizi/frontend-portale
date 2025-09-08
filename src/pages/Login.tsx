import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

type LoginResponse =
  | { ok: true; token?: string; user?: any }  // compat con backend “ok:true”
  | { token: string; user?: any }             // compat con backend “token”
  | any;

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Normalizziamo la risposta
      const token =
        (res && (res.token as string)) ||
        (res && res.ok && res.token) ||
        null;

      if (token) {
        localStorage.setItem("token", token);
      }

      // se il backend non restituisce token ma solo ok:true, andiamo avanti lo stesso
      if (token || (res && res.ok === true)) {
        // Navigazione post-login (adatta alla tua app)
        nav("/", { replace: true });
        return;
      }

      throw new Error("Credenziali non valide.");
    } catch (e: any) {
      setErr(e?.message ?? "Errore di login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "1rem"
    }}>
      <form
        onSubmit={onSubmit}
        style={{
          width: "100%",
          maxWidth: 420,
          display: "grid",
          gap: "12px",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          background: "white"
        }}
      >
        <h1 style={{ margin: 0, textAlign: "center" }}>Accedi</h1>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="es. admin@tuazienda.it"
            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              style={{
                padding: "10px 40px 10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                width: "100%"
              }}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              style={{
                position: "absolute",
                right: 6, top: 6,
                padding: "6px 10px",
                border: "1px solid #eee",
                background: "#fafafa",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 6,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
            fontWeight: 600
          }}
        >
          {loading ? "Accesso..." : "Entra"}
        </button>

        {err && (
          <div style={{ color: "#b91c1c", fontSize: 14, textAlign: "center" }}>
            {err}
          </div>
        )}

        <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          API: {import.meta.env.VITE_API_BASE_URL || "NON CONFIGURATA"}
        </div>
      </form>
    </div>
  );
}
