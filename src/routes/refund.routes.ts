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

// GET: Customers see their own, staff see all
// POST: Customer (create refund request)
// PATCH: Supervisor and above (approve/reject)
// DELETE: Manager only
router
  .route("/")
  .get(getAllRefunds)
  .post(restrictTo("customer", "supervisor", "manager"), createRefund);

router
  .route("/:id")
  .get(getRefund)
  .patch(restrictTo("supervisor", "manager"), updateRefund)
  .delete(restrictTo("manager"), deleteRefund);

export default router;
