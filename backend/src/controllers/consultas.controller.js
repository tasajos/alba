
const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const paciente_id = toInt(req.query.paciente_id);
  const medico_id = toInt(req.query.medico_id);

  let sql = `
    SELECT c.*,
           CONCAT(p.nombre,' ',p.apellido) AS paciente,
           CONCAT(pe.nombre,' ',pe.apellido) AS medico
    FROM consultas c
    JOIN pacientes p ON p.id = c.paciente_id
    JOIN medicos m ON m.id = c.medico_id
    JOIN personal pe ON pe.id = m.personal_id
  `;
  const params = [];
  const where = [];
  if (paciente_id) { where.push("c.paciente_id=?"); params.push(paciente_id); }
  if (medico_id) { where.push("c.medico_id=?"); params.push(medico_id); }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY c.fecha DESC";

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM consultas WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Consulta no encontrada" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { cita_id, paciente_id, medico_id, fecha, diagnostico, observaciones } = req.body;
  if (!paciente_id || !medico_id || !fecha)
    return res.status(400).json({ ok: false, error: "paciente_id, medico_id y fecha son obligatorios" });

  const [r] = await pool.query(
    `INSERT INTO consultas (cita_id, paciente_id, medico_id, fecha, diagnostico, observaciones)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cita_id || null, paciente_id, medico_id, fecha, diagnostico || null, observaciones || null]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { cita_id, paciente_id, medico_id, fecha, diagnostico, observaciones } = req.body;

  const [r] = await pool.query(
    `UPDATE consultas
     SET cita_id=?, paciente_id=?, medico_id=?, fecha=?, diagnostico=?, observaciones=?
     WHERE id=?`,
    [cita_id || null, paciente_id, medico_id, fecha, diagnostico || null, observaciones || null, id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Consulta no encontrada" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM consultas WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Consulta no encontrada" });
  res.json({ ok: true });
});
