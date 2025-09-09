// src/components/Navbar.tsx (estratto)
const u = JSON.parse(localStorage.getItem("user") || "null");
const isAdmin = !!u?.is_admin;

return (
  <nav>
    {/* visibile a tutti gli autenticati */}
    <a href="/segnalazione">Nuova segnalazione</a>

    {/* solo admin */}
    {isAdmin && <a href="/admin">Dashboard admin</a>}
  </nav>
);

