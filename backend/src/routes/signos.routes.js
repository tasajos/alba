const express = require("express");
const router = express.Router();
const c = require("../controllers/signos.controller");

router.get("/", c.listar); // ?consulta_id=
router.get("/:id", c.obtener);
router.post("/", c.crear);
router.put("/:id", c.actualizar);
router.delete("/:id", c.eliminar);

module.exports = router;
