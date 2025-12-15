const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const consulta_id = toInt(req.query.consulta_id);
  const estado = (req.query.estado || "").trim();

  let sql = `SELECT * FROM ordenes_laboratorio`;
  const params = [];
  const where = [];
  if (consulta_id) { where.push("consulta_id=?"); params.push(consulta_id); }
  if (estado) { where.push("estado=?"); params.push(estado); }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY id DESC";

  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);

  const [ord] = await pool.query(`SELECT * FROM ordenes_laboratorio WHERE id=?`, [id]);
  if (!ord.length) return res.status(404).json({ ok: false, error: "Orden no encontrada" });

  const [items] = await pool.query(
    `SELECT oi.*, e.nombre
     FROM orden_lab_items oi
     JOIN examenes e ON e.id = oi.examen_id
     WHERE oi.orden_id=?`,
    [id]
  );

  res.json({ ok: true, data: { ...ord[0], items } });
});

exports.crear = asyncHandler(async (req, res) => {
  const { consulta_id, items } = req.body;
  if (!consulta_id) return res.status(400).json({ ok: false, error: "consulta_id es obligatorio" });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ ok: false, error: "items es obligatorio y debe tener al menos 1" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(`INSERT INTO ordenes_laboratorio (consulta_id) VALUES (?)`, [consulta_id]);
    const orden_id = r.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO orden_lab_items (orden_id, examen_id, resultado, unidad, referencia)
         VALUES (?, ?, ?, ?, ?)`,
        [orden_id, it.examen_id, null, it.unidad || null, it.referencia || null]
      );
    }

    await conn.commit();
    res.status(201).json({ ok: true, id: orden_id });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

exports.cambiarEstado = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const { estado } = req.body; // pendiente/tomado/procesando/entregado
  if (!estado) return res.status(400).json({ ok: false, error: "estado es obligatorio" });

  const [r] = await pool.query(`UPDATE ordenes_laboratorio SET estado=? WHERE id=?`, [estado, id]);
  if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Orden no encontrada" });
  res.json({ ok: true });
});

exports.cargarResultados = asyncHandler(async (req, res) => {
  const orden_id = toInt(req.params.id);
  const { resultados } = req.body;
  // resultados: [{ item_id, resultado, unidad, referencia }]
  if (!Array.isArray(resultados) || !resultados.length)
    return res.status(400).json({ ok: false, error: "resultados es obligatorio" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // valida orden
    const [o] = await conn.query(`SELECT id FROM ordenes_laboratorio WHERE id=?`, [orden_id]);
    if (!o.length) return res.status(404).json({ ok: false, error: "Orden no encontrada" });

    for (const r of resultados) {
      await conn.query(
        `UPDATE orden_lab_items SET resultado=?, unidad=?, referencia=? WHERE id=? AND orden_id=?`,
        [r.resultado || null, r.unidad || null, r.referencia || null, r.item_id, orden_id]
      );
    }

    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

exports.eliminar = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM orden_lab_items WHERE orden_id=?`, [id]);
    const [r] = await conn.query(`DELETE FROM ordenes_laboratorio WHERE id=?`, [id]);
    if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Orden no encontrada" });
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});
