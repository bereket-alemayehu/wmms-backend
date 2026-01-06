import { Router } from "express";
import {
  getAllOutages,
  getOutage,
  createOutage,
  updateOutage,
  deleteOutage,
} from "../controllers/outage.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// All routes require authentication
router.use(protectUser);

// GET: All authenticated users
// POST: Technician and above (create outage reports)
// PATCH: Supervisor and above (update status)
// DELETE: Manager only
router
  .route("/")
  .get(getAllOutages)
  .post(restrictTo("technician", "supervisor", "manager"), createOutage);

router
  .route("/:id")
  .get(getOutage)
  .patch(restrictTo("supervisor", "manager"), updateOutage)
  .delete(restrictTo("manager"), deleteOutage);

export default router;

