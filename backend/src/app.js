// backend/src/app.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Rutas existentes
const pacientesRoutes = require("./routes/pacientes.routes");
const medicosRoutes = require("./routes/medicos.routes");
const citasRoutes = require("./routes/citas.routes");

// Rutas nuevas
const consultasRoutes = require("./routes/consultas.routes");
const signosRoutes = require("./routes/signos.routes");
const emergenciasRoutes = require("./routes/emergencias.routes");
const salasRoutes = require("./routes/salas.routes");
const camasRoutes = require("./routes/camas.routes");
const internacionesRoutes = require("./routes/internaciones.routes");
const medicamentosRoutes = require("./routes/medicamentos.routes");
const stockRoutes = require("./routes/stock.routes");
const recetasRoutes = require("./routes/recetas.routes");
const examenesRoutes = require("./routes/examenes.routes");
const ordenesLabRoutes = require("./routes/ordeneslab.routes");


const errorHandler = require("./middlewares/errorHandler");

const app = express(); // ✅ AQUÍ se define app

// Middlewares
app.use(cors());
app.use(express.json());

// Health
app.get("/api/health", (req, res) => res.json({ ok: true, name: "ALBA API" }));

// Rutas
app.use("/api/pacientes", pacientesRoutes);
app.use("/api/medicos", medicosRoutes);
app.use("/api/citas", citasRoutes);

app.use("/api/consultas", consultasRoutes);
app.use("/api/signos", signosRoutes);
app.use("/api/emergencias", emergenciasRoutes);
app.use("/api/salas", salasRoutes);
app.use("/api/camas", camasRoutes);
app.use("/api/internaciones", internacionesRoutes);
app.use("/api/medicamentos", medicamentosRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/examenes", examenesRoutes);
app.use("/api/lab/ordenes", ordenesLabRoutes);
app.use('/api/medicos', medicosRoutes);

// Error handler (al final)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ ALBA backend en http://localhost:${PORT}`));
