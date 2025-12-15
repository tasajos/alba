const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

exports.listar = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  let sql = `SELECT id, nombre, apellido, especialidad, telefono, created_at FROM medicos`;
  const params = [];
  if (q) {
    sql += ` WHERE nombre LIKE ? OR apellido LIKE ? OR especialidad LIKE ?`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ` ORDER BY id DESC`;
  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM medicos WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Médico no encontrado" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { nombre, apellido, especialidad, telefono } = req.body;
  if (!nombre || !apellido)
    return res.status(400).json({ ok: false, error: "nombre y apellido son obligatorios" });

  const [r] = await pool.query(
    `INSERT INTO medicos (nombre, apellido, especialidad, telefono)
     VALUES (?, ?, ?, ?)`,
    [nombre, apellido, especialidad || null, telefono || null]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { nombre, apellido, especialidad, telefono } = req.body;

  const [r] = await pool.query(
    `UPDATE medicos SET nombre=?, apellido=?, especialidad=?, telefono=? WHERE id=?`,
    [nombre, apellido, especialidad || null, telefono || null, id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Médico no encontrado" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM medicos WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Médico no encontrado" });
  res.json({ ok: true });
});
