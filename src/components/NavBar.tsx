// src/components/Navbar.tsx (estratto)
const u = JSON.parse(localStorage.getItem("user") || "null");
const isAdmin = !!u?.is_admin;



