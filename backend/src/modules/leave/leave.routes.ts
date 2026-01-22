// backend/src/modules/leave/leave.routes.ts
import { Router } from "express";
import {
  listLeaveTypes,
  createLeaveType,
  createLeaveRequest,
  listAllLeave,
  listMyLeave,
  updateLeaveStatus,
  assignLeave,
  getLeaveById, // ✅ ADD THIS
} from "./leave.controller";

import {
  getWorkWeekConfig,
  saveWorkWeekConfig,
  listHolidays,
  createHoliday,
  deleteHoliday,
} from "./leave.config.controller";

import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";

const router = Router();

/* ========================= Leave Types ========================= */
router.get("/types", requireAuth, asyncHandler(listLeaveTypes));
router.post(
  "/types",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createLeaveType)
);

/* ========================= Leave Config (KEEP ABOVE /:id) ========================= */
router.get(
  "/config/work-week",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(getWorkWeekConfig)
);

router.put(
  "/config/work-week",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(saveWorkWeekConfig)
);

router.get(
  "/holidays",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(listHolidays)
);

router.post(
  "/holidays",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createHoliday)
);

router.delete(
  "/holidays/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteHoliday)
);

/* ========================= Leave Requests ========================= */
router.post("/", requireAuth, asyncHandler(createLeaveRequest));
router.get("/my", requireAuth, asyncHandler(listMyLeave));

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllLeave)
);

// ✅ THIS is what your frontend needs for View page
router.get("/:id", requireAuth, asyncHandler(getLeaveById));

// ✅ Status updates
router.patch("/:id/status", requireAuth, asyncHandler(updateLeaveStatus));

// Assign leave (HR/Admin only)
router.post(
  "/assign",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(assignLeave)
);

export default router;
