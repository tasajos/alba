const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const medicamento_id = toInt(req.query.medicamento_id);

  let sql = `
    SELECT s.*, m.nombre
    FROM stock_medicamentos s
    JOIN medicamentos m ON m.id = s.medicamento_id
  `;
  const params = [];
  if (medicamento_id) { sql += ` WHERE s.medicamento_id=?`; params.push(medicamento_id); }
  sql += ` ORDER BY s.id DESC`;

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.ingreso = asyncHandler(async (req, res) => {
  const { medicamento_id, lote, vence, cantidad } = req.body;
  if (!medicamento_id || !cantidad) return res.status(400).json({ ok: false, error: "medicamento_id y cantidad son obligatorios" });

  const [r] = await pool.query(
    `INSERT INTO stock_medicamentos (medicamento_id, lote, vence, cantidad) VALUES (?, ?, ?, ?)`,
    [medicamento_id, lote || null, vence || null, cantidad]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.egreso = asyncHandler(async (req, res) => {
  const { stock_id, cantidad } = req.body;
  if (!stock_id || !cantidad) return res.status(400).json({ ok: false, error: "stock_id y cantidad son obligatorios" });

  // no dejar negativo
  const [rows] = await pool.query(`SELECT cantidad FROM stock_medicamentos WHERE id=?`, [stock_id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Stock no encontrado" });
  if (rows[0].cantidad < cantidad) return res.status(400).json({ ok: false, error: "Stock insuficiente" });

  await pool.query(`UPDATE stock_medicamentos SET cantidad=cantidad-? WHERE id=?`, [cantidad, stock_id]);
  res.json({ ok: true });
});
