const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v, def) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};

exports.listar = asyncHandler(async (req, res) => {
  const desde = req.query.desde || null; // YYYY-MM-DD
  const hasta = req.query.hasta || null;

  let sql = `
    SELECT c.id, c.fecha, c.motivo, c.estado,
           p.id AS paciente_id, CONCAT(p.nombre,' ',p.apellido) AS paciente,
           m.id AS medico_id, CONCAT(m.nombre,' ',m.apellido) AS medico, m.especialidad
    FROM citas c
    JOIN pacientes p ON p.id = c.paciente_id
    JOIN medicos m ON m.id = c.medico_id
  `;
  const params = [];
  if (desde && hasta) {
    sql += ` WHERE DATE(c.fecha) BETWEEN ? AND ?`;
    params.push(desde, hasta);
  }
  sql += ` ORDER BY c.fecha DESC`;

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM citas WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Cita no encontrada" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { paciente_id, medico_id, fecha, motivo, estado } = req.body;
  if (!paciente_id || !medico_id || !fecha)
    return res.status(400).json({ ok: false, error: "paciente_id, medico_id y fecha son obligatorios" });

  const [r] = await pool.query(
    `INSERT INTO citas (paciente_id, medico_id, fecha, motivo, estado)
     VALUES (?, ?, ?, ?, ?)`,
    [paciente_id, medico_id, fecha, motivo || null, estado || "pendiente"]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { paciente_id, medico_id, fecha, motivo, estado } = req.body;

  const [r] = await pool.query(
    `UPDATE citas
     SET paciente_id=?, medico_id=?, fecha=?, motivo=?, estado=?
     WHERE id=?`,
    [paciente_id, medico_id, fecha, motivo || null, estado || "pendiente", id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Cita no encontrada" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM citas WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Cita no encontrada" });
  res.json({ ok: true });
});
