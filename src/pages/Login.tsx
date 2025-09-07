import { useState, FormEvent } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!API_BASE) {
      setError("Config mancante: VITE_API_BASE_URL");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Errore ${res.status}`);
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // redirect alla dashboard
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Login fallito");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="grid">
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}
