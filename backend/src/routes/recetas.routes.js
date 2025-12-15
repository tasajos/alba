const express = require("express");
const router = express.Router();
const c = require("../controllers/recetas.controller");

router.get("/", c.listar);               // ?consulta_id=
router.get("/:id", c.obtener);
router.post("/", c.crear);               // crea receta + items
router.post("/:id/despachar", c.despachar); // descuenta stock (FIFO simple por id)
router.delete("/:id", c.eliminar);

module.exports = router;
