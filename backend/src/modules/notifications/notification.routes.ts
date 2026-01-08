import { Router } from "express";
import {
  listMyNotifications,
  unreadCount,
  markRead,
  markAllRead,
  deleteNotification,
} from "./notification.controller";

// use YOUR auth middleware
import { requireAuth } from "../../middleware/authMiddleware"; 
const router = Router();

router.use(requireAuth);

router.get("/", listMyNotifications);
router.get("/unread-count", unreadCount);
router.patch("/mark-all-read", markAllRead);
router.patch("/:id/read", markRead);
router.delete("/:id", deleteNotification);

export default router;
