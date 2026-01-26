import { Router } from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notification.controller";
import { protectUser } from "../middlewares/auth.middleware";

const router: Router = Router();

// All routes require authentication
router.use(protectUser);

router.get("/", getMyNotifications);
router.get("/unread/count", getUnreadCount);
router.patch("/:id/read", markAsRead);
router.patch("/read/all", markAllAsRead);
router.delete("/:id", deleteNotification);

export default router;

