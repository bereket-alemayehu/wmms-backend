const express = require("express");
const maintenanceRoutes = require("./routes/maintenanceRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/maintenance", maintenanceRoutes);

module.exports = app;
