import express from "express";
import { query } from "../db.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// 📌 Recupera tutte le categorie (accesso libero a tutti gli utenti autenticati)
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    const result = await query("SELECT * FROM categorie ORDER BY id DESC");
    res.json(result);
  } catch (err) {
    console.error("Errore recupero categorie:", err);
    res.status(500).json({ error: "Errore nel recupero categorie" });
  }
});

// 📌 Inserisci una nuova categoria (solo admin)
router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.ruolo !== "admin") {
      return res.status(403).json({ error: "Accesso negato" });
    }

    const { nome_categoria } = req.body;
    if (!nome_categoria) {
      return res.status(400).json({ error: "Il nome della categoria è obbligatorio" });
    }

    const result = await query(
      `INSERT INTO categorie (nome_categoria)
       VALUES ($1) RETURNING *`,
      [nome_categoria]
    );

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Errore inserimento categoria:", err);
    res.status(500).json({ error: "Errore nell'inserimento categoria" });
  }
});

// 📌 Elimina una categoria (solo admin)
router.delete("/:id", verifyToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.ruolo !== "admin") {
      return res.status(403).json({ error: "Accesso negato" });
    }

    const { id } = req.params;
    await query("DELETE FROM categorie WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Errore eliminazione categoria:", err);
    res.status(500).json({ error: "Errore nell'eliminazione categoria" });
  }
});

export default router;
