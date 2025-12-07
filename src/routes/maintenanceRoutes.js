const express = require('express');
const MaintenanceController = require('../controllers/maintenanceController');

const router = express.Router();
const maintenanceController = new MaintenanceController();

// Define routes for maintenance operations
router.post('/tickets', maintenanceController.createTicket.bind(maintenanceController));
router.put('/tickets/:id/status', maintenanceController.updateTicketStatus.bind(maintenanceController));
router.get('/tickets/:id/status', maintenanceController.getTicketStatus.bind(maintenanceController));

module.exports = router;