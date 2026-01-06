import { Router } from "express";
import {
  getAllOffices,
  getOffice,
  createOffice,
  updateOffice,
  deleteOffice,
} from "../controllers/office.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// All routes require authentication
router.use(protectUser);

// GET: All authenticated users
// POST/PATCH/DELETE: Supervisor and above
router
  .route("/")
  .get(getAllOffices)
  .post(restrictTo("supervisor", "manager"), createOffice);

router
  .route("/:id")
  .get(getOffice)
  .patch(restrictTo("supervisor", "manager"), updateOffice)
  .delete(restrictTo("manager"), deleteOffice);

export default router;

