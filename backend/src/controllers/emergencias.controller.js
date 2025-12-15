const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");


const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const estado = (req.query.estado || "").trim();
  let sql = `
    SELECT e.*, CONCAT(p.nombre,' ',p.apellido) AS paciente
    FROM emergencias e
    JOIN pacientes p ON p.id = e.paciente_id
  `;
  const params = [];
  if (estado) { sql += ` WHERE e.estado=?`; params.push(estado); }
  sql += ` ORDER BY e.fecha_ingreso DESC`;

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM emergencias WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Emergencia no encontrada" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { paciente_id, servicio_id, fecha_ingreso, triage, motivo, estado } = req.body;
  if (!paciente_id || !fecha_ingreso || !triage)
    return res.status(400).json({ ok: false, error: "paciente_id, fecha_ingreso y triage son obligatorios" });

  const [r] = await pool.query(
    `INSERT INTO emergencias (paciente_id, servicio_id, fecha_ingreso, triage, motivo, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [paciente_id, servicio_id || null, fecha_ingreso, triage, motivo || null, estado || "en_atencion"]
  );

  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { paciente_id, servicio_id, fecha_ingreso, triage, motivo, estado } = req.body;

  const [r] = await pool.query(
    `UPDATE emergencias
     SET paciente_id=?, servicio_id=?, fecha_ingreso=?, triage=?, motivo=?, estado=?
     WHERE id=?`,
    [paciente_id, servicio_id || null, fecha_ingreso, triage, motivo || null, estado || "en_atencion", id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Emergencia no encontrada" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM emergencias WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Emergencia no encontrada" });
  res.json({ ok: true });
});
