const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  let sql = `SELECT * FROM examenes`;
  const params = [];
  if (q) { sql += ` WHERE nombre LIKE ?`; params.push(`%${q}%`); }
  sql += ` ORDER BY id DESC`;
  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM examenes WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Examen no encontrado" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { nombre, tipo } = req.body;
  if (!nombre) return res.status(400).json({ ok: false, error: "nombre es obligatorio" });

  const [r] = await pool.query(`INSERT INTO examenes (nombre, tipo) VALUES (?, ?)`, [nombre, tipo || null]);
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { nombre, tipo } = req.body;
  const [r] = await pool.query(`UPDATE examenes SET nombre=?, tipo=? WHERE id=?`, [nombre, tipo || null, id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Examen no encontrado" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM examenes WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Examen no encontrado" });
  res.json({ ok: true });
});
