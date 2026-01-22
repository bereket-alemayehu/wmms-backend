import { Router } from "express";
import {
  getAllRefunds,
  getRefund,
  createRefund,
  updateRefund,
  deleteRefund,
  checkRefundApprovalEligibility,
} from "../controllers/refund.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// All routes require authentication
router.use(protectUser);

// GET: Customers see their own; managers see refunds for their office
// POST: Customer (create refund request)
// PATCH: Supervisor and above (approve/reject)
// DELETE: Manager only
router
  .route("/")
  .get(restrictTo("customer", "manager"), getAllRefunds)
  .post(restrictTo("customer"), createRefund);

router
  .route("/:id")
  .get(restrictTo("customer", "manager"), getRefund)
  .patch(restrictTo("manager"), updateRefund)
  .delete(restrictTo("manager"), deleteRefund);

// Check if refund can be approved
router.get("/:id/can-approve", restrictTo("manager"), checkRefundApprovalEligibility);

export default router;
