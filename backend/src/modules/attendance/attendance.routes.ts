// backend/src/modules/attendance/attendance.routes.ts
import { Router } from "express";
import {
  clockIn,
  clockOut,
  listMyAttendance,
  listAllAttendance,
} from "./attendance.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/clock-in", requireAuth, asyncHandler(clockIn));
router.post("/clock-out", requireAuth, asyncHandler(clockOut));
router.get("/my", requireAuth, asyncHandler(listMyAttendance));

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllAttendance)
);

export default router;
