import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.login(email, password);

      // 🔹 salvo token, email e ruolo
      localStorage.setItem("token", res.token);
      localStorage.setItem("email", res.user.email);
      localStorage.setItem("role", res.user.ruolo);

      // redirect in base al ruolo
      if (res.user.ruolo === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/segnalazione");
      }
    } catch (err: any) {
      setError(err.message || "Errore durante il login");
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
