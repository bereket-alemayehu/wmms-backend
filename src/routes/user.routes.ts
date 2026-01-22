import { Router } from "express";
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getTechniciansByOffice,
  getSupervisorsByOffice,
  getCustomersByOffice,
} from "../controllers/user.controller";
import { protectUser, restrictTo } from "../middlewares/auth.middleware";

const router: Router = Router();

// Protect all user routes - require authentication
router.use(protectUser);

// Office-filtered user endpoints
// Supervisors can see technicians in their office
router.get("/technicians", restrictTo("manager", "supervisor"), getTechniciansByOffice);
// Only managers can see supervisors
router.get("/supervisors", restrictTo("manager"), getSupervisorsByOffice);
// Technicians can see customers in their office
router.get("/customers", restrictTo("manager", "technician"), getCustomersByOffice);

// General user routes
// Only managers can get all users
router.get("/", restrictTo("manager"), getAllUsers);
// Only managers can create users
router.post("/", restrictTo("manager"), createUser);

// Get single user - accessible to managers, supervisors, and technicians (with office filtering)
router.get("/:id", getUser);
// Only managers and supervisors can update users
router.patch("/:id", restrictTo("manager", "supervisor"), updateUser);
// Only managers can delete users
router.delete("/:id", restrictTo("manager"), deleteUser);

export default router;
