const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const estado = (req.query.estado || "").trim();
  const sala_id = toInt(req.query.sala_id);

  let sql = `
    SELECT c.*, s.nombre AS sala
    FROM camas c
    JOIN salas s ON s.id = c.sala_id
  `;
  const params = [];
  const where = [];
  if (estado) { where.push("c.estado=?"); params.push(estado); }
  if (sala_id) { where.push("c.sala_id=?"); params.push(sala_id); }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY c.id DESC";

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM camas WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Cama no encontrada" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { sala_id, codigo, estado } = req.body;
  if (!sala_id || !codigo) return res.status(400).json({ ok: false, error: "sala_id y codigo son obligatorios" });

  const [r] = await pool.query(
    `INSERT INTO camas (sala_id, codigo, estado) VALUES (?, ?, ?)`,
    [sala_id, codigo, estado || "LIBRE"]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { sala_id, codigo, estado } = req.body;

  const [r] = await pool.query(
    `UPDATE camas SET sala_id=?, codigo=?, estado=? WHERE id=?`,
    [sala_id, codigo, estado, id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Cama no encontrada" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM camas WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Cama no encontrada" });
  res.json({ ok: true });
});
