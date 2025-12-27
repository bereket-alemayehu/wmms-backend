import { Router } from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// Protect all user routes - only managers and supervisors
router.use(protectUser);
router.use(restrictTo("manager", "supervisor"));

router.route("/").get(getAllUsers).post(restrictTo("manager"), createUser);

router.route("/:id").get(getUser).patch(updateUser).delete(restrictTo("manager"), deleteUser);

export default router;
