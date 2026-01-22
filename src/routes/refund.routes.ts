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

// GET: Role-based access
//   - Customers see only their own refunds
//   - Managers see only refunds from their office
//   - Supervisors and above see all refunds
// POST: Removed - Refunds are now created automatically via ticket refund requests
// PATCH: Supervisor and above (approve/reject)
// DELETE: Manager only
router
  .route("/")
  .get(getAllRefunds);

router
  .route("/:id")
  .get(getRefund)
  .patch(restrictTo("supervisor", "manager"), updateRefund)
  .delete(restrictTo("manager"), deleteRefund);

export default router;
