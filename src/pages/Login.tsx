import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// chiamata minimale: adatta alla tua api.ts se l'hai già
async function doLogin(email: string, password: string) {
  const base = import.meta.env.VITE_API_BASE_URL; // deve finire con /api
  const r = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const msg = await r.text().catch(() => "");
    throw new Error(msg || `HTTP ${r.status}`);
  }
  return (await r.json()) as { token: string; user: { ruolo: string } };
}

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const { token, user } = await doLogin(email.trim(), password);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      // redirect in base al ruolo
      if (user?.ruolo === "admin") nav("/dashboard", { replace: true });
      else nav("/segnalazione", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login fallita");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0b0e] text-white p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-[#15151b] p-6 rounded-2xl border border-[#23232b] space-y-4">
        <h1 className="text-xl font-semibold">Login</h1>
        {err && <div className="text-red-400 text-sm">{err}</div>}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          className="w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
          required
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          className="w-full rounded-md bg-[#0f0f14] border border-[#2a2a34] px-3 py-2 outline-none focus:border-[#6c5ce7]"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-[#6c5ce7] hover:bg-[#5a49e0] transition-colors px-4 py-2 font-medium disabled:opacity-60"
        >
          Accedi
        </button>
      </form>
    </div>
  );
}
