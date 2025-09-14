// src/routes/segnalazioni.ts
import express from "express";
import { query } from "../db.js";
import { verifyToken, AuthRequest } from "../middleware/auth.js";

const router = express.Router();

// 📌 Recupera tutte le segnalazioni
router.get("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    let sql = `
      SELECT 
        s.id, 
        s.data, 
        s.ora, 
        c.nome_categoria AS categoria, 
        cl.nome_sala AS sala, 
        s.descrizione
      FROM segnalazioni s
      JOIN categorie c ON s.categoria_id = c.id
      JOIN clienti cl ON s.cliente_id = cl.id
    `;

    const params: any[] = [];

    // 👉 Se l'utente è operatore, filtro per la sua sala
    if (req.user?.ruolo === "operatore" && req.user?.cliente_id) {
      sql += ` WHERE s.cliente_id = $1`;
      params.push(req.user.cliente_id);
    }

    sql += ` ORDER BY s.data DESC, s.ora DESC`;

    const result = await query(sql, params);
    res.json(result);
  } catch (err) {
    console.error("Errore recupero segnalazioni:", err);
    res.status(500).json({ error: "Errore nel recupero delle segnalazioni" });
  }
});

// 📌 Inserisci una nuova segnalazione
router.post("/", verifyToken, async (req: AuthRequest, res) => {
  try {
    let { data, ora, descrizione, cliente_id, categoria_id } = req.body;

    // 👉 Se è un operatore, forza il cliente_id alla sua sala
    if (req.user?.ruolo === "operatore" && req.user?.cliente_id) {
      cliente_id = req.user.cliente_id;
    }

    if (!data || !ora || !descrizione || !cliente_id || !categoria_id) {
      return res.status(400).json({ error: "Tutti i campi sono obbligatori" });
    }

    const result = await query(
      `INSERT INTO segnalazioni (data, ora, descrizione, cliente_id, categoria_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data, ora, descrizione, cliente_id, categoria_id]
    );

    res.status(201).json(result[0]);
  } catch (err) {
    console.error("Errore inserimento segnalazione:", err);
    res.status(500).json({ error: "Errore nell'inserimento della segnalazione" });
  }
});

export default router;
