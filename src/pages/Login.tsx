import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        throw new Error("Credenziali non valide");
      }

      const data = await res.json();

      // Salva il token in localStorage
      localStorage.setItem("token", data.token);

      // Reindirizza alla dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Errore di connessione");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={submit} className="login-box">
        <h2>Login</h2>
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
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
