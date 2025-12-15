const pool = require("../db");
const asyncHandler = require("../utils/asyncHandler");

const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

exports.listar = asyncHandler(async (req, res) => {
  const consulta_id = toInt(req.query.consulta_id);
  let sql = `SELECT * FROM recetas`;
  const params = [];
  if (consulta_id) { sql += ` WHERE consulta_id=?`; params.push(consulta_id); }
  sql += ` ORDER BY id DESC`;
  const [rows] = await pool.query(sql, params);
  res.json({ ok: true, data: rows });
});

exports.obtener = asyncHandler(async (req, res) => {
  const id = toInt(req.params.id);
  const [rec] = await pool.query(`SELECT * FROM recetas WHERE id=?`, [id]);
  if (!rec.length) return res.status(404).json({ ok: false, error: "Receta no encontrada" });

  const [items] = await pool.query(
    `SELECT ri.*, m.nombre
     FROM receta_items ri
     JOIN medicamentos m ON m.id = ri.medicamento_id
     WHERE ri.receta_id=?`,
    [id]
  );

  res.json({ ok: true, data: { ...rec[0], items } });
});

exports.crear = asyncHandler(async (req, res) => {
  const { consulta_id, items } = req.body;
  if (!consulta_id) return res.status(400).json({ ok: false, error: "consulta_id es obligatorio" });
  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ ok: false, error: "items es obligatorio y debe tener al menos 1" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [r] = await conn.query(`INSERT INTO recetas (consulta_id) VALUES (?)`, [consulta_id]);
    const receta_id = r.insertId;

    for (const it of items) {
      await conn.query(
        `INSERT INTO receta_items (receta_id, medicamento_id, dosis, frecuencia, dias, indicaciones)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          receta_id,
          it.medicamento_id,
          it.dosis || null,
          it.frecuencia || null,
          it.dias ?? null,
          it.indicaciones || null,
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ ok: true, id: receta_id });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

// Descuento FIFO simple: toma stock_medicamentos por medicamento_id ordenado por id (podemos mejorar a vence ASC)
exports.despachar = asyncHandler(async (req, res) => {
  const receta_id = toInt(req.params.id);
  const { cantidades } = req.body; 
  // cantidades: [{ medicamento_id, cantidad }]
  if (!Array.isArray(cantidades) || !cantidades.length)
    return res.status(400).json({ ok: false, error: "cantidades es obligatorio" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // valida receta
    const [rec] = await conn.query(`SELECT id FROM recetas WHERE id=?`, [receta_id]);
    if (!rec.length) return res.status(404).json({ ok: false, error: "Receta no encontrada" });

    for (const c of cantidades) {
      const medId = c.medicamento_id;
      let restante = c.cantidad;

      const [stocks] = await conn.query(
        `SELECT id, cantidad FROM stock_medicamentos
         WHERE medicamento_id=? AND cantidad>0
         ORDER BY id ASC`,
        [medId]
      );

      const total = stocks.reduce((a, s) => a + s.cantidad, 0);
      if (total < restante) {
        return res.status(400).json({ ok: false, error: `Stock insuficiente para medicamento_id=${medId}` });
      }

      for (const s of stocks) {
        if (restante <= 0) break;
        const tomar = Math.min(restante, s.cantidad);
        await conn.query(`UPDATE stock_medicamentos SET cantidad=cantidad-? WHERE id=?`, [tomar, s.id]);
        restante -= tomar;
      }
    }

    await conn.commit();
    res.json({ ok: true, message: "Receta despachada y stock actualizado" });
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
    await conn.query(`DELETE FROM receta_items WHERE receta_id=?`, [id]);
    const [r] = await conn.query(`DELETE FROM recetas WHERE id=?`, [id]);
    if (!r.affectedRows) return res.status(404).json({ ok: false, error: "Receta no encontrada" });
    await conn.commit();
    res.json({ ok: true });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});
