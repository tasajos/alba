const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT * FROM salas ORDER BY id DESC`);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM salas WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Sala no encontrada" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ ok: false, error: "nombre es obligatorio" });

  const [r] = await pool.query(`INSERT INTO salas (nombre) VALUES (?)`, [nombre]);
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { nombre } = req.body;

  const [r] = await pool.query(`UPDATE salas SET nombre=? WHERE id=?`, [nombre, id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Sala no encontrada" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM salas WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Sala no encontrada" });
  res.json({ ok: true });
});
