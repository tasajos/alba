const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const consulta_id = toInt(req.query.consulta_id);
  let sql = `SELECT * FROM signos_vitales`;
  const params = [];
  if (consulta_id) { sql += ` WHERE consulta_id=?`; params.push(consulta_id); }
  sql += ` ORDER BY id DESC`;
  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM signos_vitales WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Registro no encontrado" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { consulta_id, temperatura, presion, fc, fr, spo2, peso, talla } = req.body;
  if (!consulta_id) return res.status(400).json({ ok: false, error: "consulta_id es obligatorio" });

  const [r] = await pool.query(
    `INSERT INTO signos_vitales (consulta_id, temperatura, presion, fc, fr, spo2, peso, talla)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [consulta_id, temperatura ?? null, presion ?? null, fc ?? null, fr ?? null, spo2 ?? null, peso ?? null, talla ?? null]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { consulta_id, temperatura, presion, fc, fr, spo2, peso, talla } = req.body;

  const [r] = await pool.query(
    `UPDATE signos_vitales
     SET consulta_id=?, temperatura=?, presion=?, fc=?, fr=?, spo2=?, peso=?, talla=?
     WHERE id=?`,
    [consulta_id, temperatura ?? null, presion ?? null, fc ?? null, fr ?? null, spo2 ?? null, peso ?? null, talla ?? null, id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Registro no encontrado" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM signos_vitales WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Registro no encontrado" });
  res.json({ ok: true });
});
