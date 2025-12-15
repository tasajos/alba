const express = require("express");
const router = express.Router();
const c = require("../controllers/stock.controller");

router.get("/", c.listar);             // ?medicamento_id=
router.post("/ingreso", c.ingreso);    // sumar stock
router.post("/egreso", c.egreso);      // restar stock (por receta o manual)

module.exports = router;
