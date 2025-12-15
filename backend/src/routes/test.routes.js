// backend/src/routes/test.routes.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/ping", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");
    res.json({ ok: true, db: rows[0].result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, error: "Error en la base de datos" });
  }
});

module.exports = router;
