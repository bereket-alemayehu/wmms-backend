import { Router } from "express";
import {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  getTicketQueuePosition,
  checkTicketRefundEligibility,
  assignTicketToTechnician,
  changeTicketStatus,
  getCustomerTickets,
  getOfficeTickets,
  getTechnicianTickets,
  getOfficeQueueStatistics,
  submitTicketFeedback,
  requestTicketRefund,
  confirmTicketResolution,
  markTicketNotResolved,
} from "../controllers/ticket.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// All routes require authentication
router.use(protectUser);

// Basic CRUD routes
router
  .route("/")
  .get(
    restrictTo("supervisor", "manager", "technician"),
    getAllTickets
  )
  .post(createTicket); // Customers can create tickets

router
  .route("/:id")
  .get(getTicket) // All authenticated users can view tickets
  .patch(restrictTo("supervisor", "manager", "technician"), updateTicket)
  .delete(restrictTo("manager"), deleteTicket);

// Custom routes: Queue and Status
router.get("/:id/queue-position", getTicketQueuePosition);
router.get("/:id/refund-eligibility", checkTicketRefundEligibility);
router.patch(
  "/:id/assign",
  restrictTo("supervisor", "manager"),
  assignTicketToTechnician
);
router.patch(
  "/:id/status",
  restrictTo("supervisor", "manager", "technician"),
  changeTicketStatus
);

// Custom routes: Filtered views
router.get("/customer/my-tickets", getCustomerTickets);
router.get("/office/tickets", restrictTo("supervisor", "manager"), getOfficeTickets);
router.get("/technician/my-tickets", restrictTo("technician"), getTechnicianTickets);
router.get("/office/statistics", restrictTo("supervisor", "manager"), getOfficeQueueStatistics);

// Custom routes: Feedback and Refunds
router.post("/:id/feedback", submitTicketFeedback);
router.post("/:id/request-refund", requestTicketRefund);
router.post("/:id/confirm-resolution", restrictTo("customer"), confirmTicketResolution);
router.post("/:id/not-resolved", restrictTo("customer"), markTicketNotResolved);

export default router;



