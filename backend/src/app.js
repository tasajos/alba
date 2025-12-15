const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pacientesRoutes = require("./routes/pacientes.routes");
const medicosRoutes = require("./routes/medicos.routes");
const citasRoutes = require("./routes/citas.routes");

const errorHandler = require("./middlewares/errorHandler");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true, name: "ALBA API" }));

app.use("/api/pacientes", pacientesRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/citas", citasRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ ALBA backend en http://localhost:${PORT}`));
