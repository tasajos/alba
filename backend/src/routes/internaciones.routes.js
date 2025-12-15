const express = require("express");
const router = express.Router();
const c = require("../controllers/internaciones.controller");

router.get("/", c.listar);
router.get("/:id", c.obtener);
router.post("/", c.crear);
router.put("/:id", c.actualizar);
router.delete("/:id", c.eliminar);

// acciones útiles
router.post("/:id/asignar-cama", c.asignarCama);
router.post("/:id/alta", c.darAlta);

module.exports = router;
