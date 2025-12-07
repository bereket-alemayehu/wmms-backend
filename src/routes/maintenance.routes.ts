import express, { Router } from "express";
import MaintenanceController from "../controllers/maintenance.controller";

const router: Router = express.Router();
const maintenanceController = new MaintenanceController();

// Define routes for maintenance operations
router.post(
  "/tickets",
  maintenanceController.createTicket.bind(maintenanceController)
);
router.put(
  "/tickets/:id/status",
  maintenanceController.updateTicketStatus.bind(maintenanceController)
);
router.get(
  "/tickets/:id/status",
  maintenanceController.getTicketStatus.bind(maintenanceController)
);

export default router;

