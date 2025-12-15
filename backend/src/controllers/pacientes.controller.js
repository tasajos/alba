const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

exports.listar = asyncHandler(async (req, res) => {
  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 20)));
  const offset = (page - 1) * limit;
  const q = (req.query.q || "").trim();

  let sql = `SELECT id, nombre, apellido, ci, fecha_nacimiento, telefono, direccion, created_at
             FROM pacientes`;
  let params = [];
  if (q) {
    sql += ` WHERE nombre LIKE ? OR apellido LIKE ? OR ci LIKE ?`;
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ` ORDER BY id DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, page, limit, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM pacientes WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Paciente no encontrado" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { nombre, apellido, ci, fecha_nacimiento, telefono, direccion } = req.body;

  if (!nombre || !apellido) {
    return res.status(400).json({ ok: false, error: "nombre y apellido son obligatorios" });
  }

  const [r] = await pool.query(
    `INSERT INTO pacientes (nombre, apellido, ci, fecha_nacimiento, telefono, direccion)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, ci || null, fecha_nacimiento || null, telefono || null, direccion || null]
  );

  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { nombre, apellido, ci, fecha_nacimiento, telefono, direccion } = req.body;

  const [r] = await pool.query(
    `UPDATE pacientes
     SET nombre=?, apellido=?, ci=?, fecha_nacimiento=?, telefono=?, direccion=?
     WHERE id=?`,
    [nombre, apellido, ci || null, fecha_nacimiento || null, telefono || null, direccion || null, id]
  );

  if (r.affectedRows === 0)
    return res.status(404).json({ ok: false, error: "Paciente no encontrado" });

  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM pacientes WHERE id=?`, [id]);
  if (r.affectedRows === 0)
    return res.status(404).json({ ok: false, error: "Paciente no encontrado" });
  res.json({ ok: true });
});
