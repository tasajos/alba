const express = require("express");
const router = express.Router();
const c = require("../controllers/ordeneslab.controller");

router.get("/", c.listar);            // ?consulta_id=&estado=
router.get("/:id", c.obtener);
router.post("/", c.crear);            // crea orden + items
router.put("/:id/estado", c.cambiarEstado);
router.put("/:id/resultados", c.cargarResultados); // actualiza resultado de items
router.delete("/:id", c.eliminar);

module.exports = router;
