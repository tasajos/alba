const express = require("express");
const router = express.Router();
const c = require("../controllers/medicos.controller");

// GET /api/medicos?q=
router.get("/", c.listar);

// GET /api/medicos/por-especialidad/:especialidad
router.get("/por-especialidad/:especialidad", c.listarPorEspecialidad);

// GET /api/medicos/:id
router.get("/:id", c.obtener);

router.post("/", c.crear);
router.put("/:id", c.actualizar);
router.delete("/:id", c.eliminar);



module.exports = router;
