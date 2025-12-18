const pool = require("../db");

exports.listar = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (q) {
      where.push(`
        (
          p.nombre LIKE ? OR p.apellido LIKE ? OR p.ci LIKE ? OR
          m.nombre LIKE ? OR m.apellido LIKE ? OR m.ci LIKE ? OR
          c.estado LIKE ? OR c.motivo LIKE ?
        )
      `);
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like, like, like);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.paciente_id,
        c.medico_id,
        c.fecha,
        c.motivo,
        c.estado,
        c.created_at,
        CONCAT(p.nombre,' ',p.apellido) AS paciente_nombre,
        CONCAT(m.nombre,' ',m.apellido) AS medico_nombre,
        m.especialidad AS medico_especialidad
      FROM citas c
      JOIN pacientes p ON p.id = c.paciente_id
      JOIN medicos m ON m.id = c.medico_id
      ${whereSql}
      ORDER BY c.fecha DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({ ok: true, page, limit, data: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error listando citas" });
  }
};

exports.crear = async (req, res) => {
  try {
    const { paciente_id, medico_id, fecha, motivo, estado } = req.body;

    if (!paciente_id || !medico_id || !fecha) {
      return res.status(400).json({
        ok: false,
        message: "paciente_id, medico_id y fecha son obligatorios",
      });
    }

    // ✅ Validar FK: paciente existe
    const [pRows] = await pool.query(`SELECT id FROM pacientes WHERE id = ?`, [paciente_id]);
    if (!pRows.length) {
      return res.status(400).json({ ok: false, message: `Paciente no existe (id=${paciente_id})` });
    }

    // ✅ Validar FK: medico existe
    const [mRows] = await pool.query(`SELECT id FROM medicos WHERE id = ?`, [medico_id]);
    if (!mRows.length) {
      return res.status(400).json({ ok: false, message: `Médico no existe (id=${medico_id})` });
    }

    const [r] = await pool.query(
      `INSERT INTO citas (paciente_id, medico_id, fecha, motivo, estado)
       VALUES (?, ?, ?, ?, ?)`,
      [paciente_id, medico_id, fecha, motivo || null, estado || "PROGRAMADA"]
    );

    res.json({ ok: true, id: r.insertId });
  } catch (e) {
    console.error("ERROR POST /citas =>", e);
    res.status(500).json({ ok: false, message: "Error creando cita" });
  }
};
exports.actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { paciente_id, medico_id, fecha, motivo, estado } = req.body;

    if (!id) return res.status(400).json({ ok: false, message: "id inválido" });

    await pool.query(
      `UPDATE citas
       SET paciente_id = ?, medico_id = ?, fecha = ?, motivo = ?, estado = ?
       WHERE id = ?`,
      [paciente_id, medico_id, fecha, motivo || null, estado || "PROGRAMADA", id]
    );

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error actualizando cita" });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query(`DELETE FROM citas WHERE id = ?`, [id]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "Error eliminando cita" });
  }
};
