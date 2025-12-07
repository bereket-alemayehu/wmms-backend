import express, { Application } from "express";
import maintenanceRoutes from "./routes/maintenance.routes";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/maintenance", maintenanceRoutes);

export default app;

