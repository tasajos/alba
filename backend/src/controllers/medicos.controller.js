const db = require("../db");

// GET /api/medicos?q=
exports.listar = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    let sql = "SELECT * FROM medicos";
    let params = [];

    if (q) {
      const like = `%${q}%`;
      sql += " WHERE nombre LIKE ? OR apellido LIKE ? OR ci LIKE ? OR especialidad LIKE ?";
      params = [like, like, like, like];
    }

    sql += " ORDER BY id DESC";

    const [rows] = await db.query(sql, params);
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("listar medicos error:", err);
    return res.status(500).json({ ok: false, error: "Error en la base de datos" });
  }
};

// GET /api/medicos/:id
exports.obtener = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [rows] = await db.query("SELECT * FROM medicos WHERE id = ?", [id]);
    if (!rows.length) return res.status(404).json({ ok: false, error: "No encontrado" });
    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error("obtener medico error:", err);
    return res.status(500).json({ ok: false, error: "Error en la base de datos" });
  }
};

// POST /api/medicos
exports.crear = async (req, res) => {
  try {
    const { nombre, apellido, ci, especialidad, telefono, email } = req.body;

    if (!nombre || !apellido || !especialidad) {
      return res.status(400).json({
        ok: false,
        error: "nombre, apellido y especialidad son obligatorios",
      });
    }

    const [r] = await db.query(
      `INSERT INTO medicos (nombre, apellido, ci, especialidad, telefono, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, ci || null, especialidad, telefono || null, email || null]
    );

    return res.status(201).json({ ok: true, id: r.insertId });
  } catch (err) {
    console.error("crear medico error:", err);
    return res.status(500).json({ ok: false, error: "Error en la base de datos" });
  }
};

// PUT /api/medicos/:id
exports.actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { nombre, apellido, ci, especialidad, telefono, email } = req.body;

    const [r] = await db.query(
      `UPDATE medicos
       SET nombre = ?, apellido = ?, ci = ?, especialidad = ?, telefono = ?, email = ?
       WHERE id = ?`,
      [nombre, apellido, ci || null, especialidad, telefono || null, email || null, id]
    );

    if (r.affectedRows === 0) return res.status(404).json({ ok: false, error: "No encontrado" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("actualizar medico error:", err);
    return res.status(500).json({ ok: false, error: "Error en la base de datos" });
  }
};

// DELETE /api/medicos/:id
exports.eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [r] = await db.query("DELETE FROM medicos WHERE id = ?", [id]);
    if (r.affectedRows === 0) return res.status(404).json({ ok: false, error: "No encontrado" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("eliminar medico error:", err);
    return res.status(500).json({ ok: false, error: "Error en la base de datos" });
  }
};



exports.listarPorEspecialidad = async (req, res) => {
  try {
    const especialidad = (req.params.especialidad || "").trim();
    if (!especialidad) {
      return res.status(400).json({ ok: false, message: "especialidad requerida" });
    }

    const [rows] = await db.query(
      `
      SELECT id, nombre, apellido, ci, telefono, email, especialidad, created_at
      FROM medicos
      WHERE LOWER(especialidad) = LOWER(?)
      ORDER BY apellido ASC, nombre ASC
      `,
      [especialidad]
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listarPorEspecialidad ERROR:", e);
    res.status(500).json({ ok: false, message: "Error listando médicos por especialidad" });
  }
};


// GET /medicos/por-especialidad/:especialidad
exports.listarPorEspecialidad = async (req, res) => {
  try {
    const especialidad = (req.params.especialidad || "").trim();

    if (!especialidad) {
      return res.status(400).json({ ok: false, message: "especialidad requerida" });
    }

    const [rows] = await db.query(
      `
      SELECT id, nombre, apellido, ci, telefono, email, especialidad, created_at
      FROM medicos
      WHERE LOWER(especialidad) = LOWER(?)
      ORDER BY apellido ASC, nombre ASC
      `,
      [especialidad]
    );

    res.json({ ok: true, data: rows });
  } catch (e) {
    console.error("listarPorEspecialidad ERROR:", e);
    res.status(500).json({ ok: false, message: "Error listando médicos por especialidad" });
  }
};
