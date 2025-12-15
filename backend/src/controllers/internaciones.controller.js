const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const estado = (req.query.estado || "").trim(); // ACTIVA/ALTA/TRASLADADA

  let sql = `
    SELECT i.*,
           CONCAT(p.nombre,' ',p.apellido) AS paciente,
           CONCAT(pe.nombre,' ',pe.apellido) AS medico,
           c.codigo AS cama_codigo
    FROM internaciones i
    JOIN pacientes p ON p.id = i.paciente_id
    JOIN medicos m ON m.id = i.medico_id
    JOIN personal pe ON pe.id = m.personal_id
    LEFT JOIN camas c ON c.id = i.cama_id
  `;
  const params = [];
  if (estado) { sql += ` WHERE i.estado=?`; params.push(estado); }
  sql += ` ORDER BY i.fecha_ingreso DESC`;

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rows] = await pool.query(`SELECT * FROM internaciones WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Internación no encontrada" });
  res.json({ ok: true, data: rows[0] });
});

exports.crear = asyncHandler(async (req, res) => {
  const { paciente_id, medico_id, cama_id, fecha_ingreso, diagnostico_ingreso, estado } = req.body;
  if (!paciente_id || !medico_id || !fecha_ingreso)
    return res.status(400).json({ ok: false, error: "paciente_id, medico_id y fecha_ingreso son obligatorios" });

  // si asigna cama al crear: marcar cama OCUPADA
  if (cama_id) {
    await pool.query(`UPDATE camas SET estado='OCUPADA' WHERE id=?`, [cama_id]);
  }

  const [r] = await pool.query(
    `INSERT INTO internaciones (paciente_id, medico_id, cama_id, fecha_ingreso, diagnostico_ingreso, estado)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [paciente_id, medico_id, cama_id || null, fecha_ingreso, diagnostico_ingreso || null, estado || "ACTIVA"]
  );

  res.status(201).json({ ok: true, id: r.insertId });
});

exports.actualizar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { paciente_id, medico_id, cama_id, fecha_ingreso, fecha_alta, diagnostico_ingreso, estado } = req.body;

  const [r] = await pool.query(
    `UPDATE internaciones
     SET paciente_id=?, medico_id=?, cama_id=?, fecha_ingreso=?, fecha_alta=?, diagnostico_ingreso=?, estado=?
     WHERE id=?`,
    [paciente_id, medico_id, cama_id || null, fecha_ingreso, fecha_alta || null, diagnostico_ingreso || null, estado || "ACTIVA", id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Internación no encontrada" });
  res.json({ ok: true });
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [r] = await pool.query(`DELETE FROM internaciones WHERE id=?`, [id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Internación no encontrada" });
  res.json({ ok: true });
});

exports.asignarCama = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { cama_id } = req.body;
  if (!cama_id) return res.status(400).json({ ok: false, error: "cama_id es obligatorio" });

  // liberar cama anterior si existía
  const [prev] = await pool.query(`SELECT cama_id FROM internaciones WHERE id=?`, [id]);
  if (!prev.length) return res.status(404).json({ ok: false, error: "Internación no encontrada" });

  const camaAnterior = prev[0].cama_id;
  if (camaAnterior) await pool.query(`UPDATE camas SET estado='LIBRE' WHERE id=?`, [camaAnterior]);

  // ocupar nueva cama
  await pool.query(`UPDATE camas SET estado='OCUPADA' WHERE id=?`, [cama_id]);
  await pool.query(`UPDATE internaciones SET cama_id=? WHERE id=?`, [cama_id, id]);

  res.json({ ok: true });
});

exports.darAlta = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { fecha_alta } = req.body;

  const [rows] = await pool.query(`SELECT cama_id FROM internaciones WHERE id=?`, [id]);
  if (!rows.length) return res.status(404).json({ ok: false, error: "Internación no encontrada" });

  const cama_id = rows[0].cama_id;
  if (cama_id) await pool.query(`UPDATE camas SET estado='LIBRE' WHERE id=?`, [cama_id]);

  const [r] = await pool.query(
    `UPDATE internaciones SET estado='ALTA', fecha_alta=? WHERE id=?`,
    [fecha_alta || new Date(), id]
  );

  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Internación no encontrada" });
  res.json({ ok: true });
});
