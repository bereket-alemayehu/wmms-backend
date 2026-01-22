import { Router } from "express";
import {
  getAllRefunds,
  getRefund,
  createRefund,
  updateRefund,
  deleteRefund,
} from "../controllers/refund.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// All routes require authentication
router.use(protectUser);

// GET: Restricted to customers and managers only
//   - Customers see only their own refunds
//   - Managers see only refunds from their office (higher role)
// POST: Removed - Refunds are now created automatically via ticket refund requests
// PATCH: Manager only (approve/reject)
// DELETE: Manager only
router
  .route("/")
  .get(restrictTo("customer", "manager"), getAllRefunds);

router
  .route("/:id")
  .get(restrictTo("customer", "manager"), getRefund)
  .patch(restrictTo("manager"), updateRefund)
  .delete(restrictTo("manager"), deleteRefund);

export default router;
