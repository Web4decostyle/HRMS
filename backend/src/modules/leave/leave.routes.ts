// backend/src/modules/leave/leave.routes.ts
import { Router } from "express";
import {
  listLeaveTypes,
  createLeaveType,
  deleteLeaveType,
  createLeaveRequest,
  listAllLeave,
  listMyLeave,
  updateLeaveStatus,
  assignLeave,
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

// Leave types
router.get("/types", requireAuth, asyncHandler(listLeaveTypes));
router.post(
  "/types",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createLeaveType)
);

router.delete(
  "/types/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteLeaveType)
);

// Work Week config (HR / Admin)
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

// Holidays (HR / Admin)
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

// Employee requests
router.post("/", requireAuth, asyncHandler(createLeaveRequest));

// My leave (logged-in employee)
router.get("/my", requireAuth, asyncHandler(listMyLeave));

// HR/Admin assigns leave directly (no approval chain)
router.post(
  "/assign",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(assignLeave)
);

// Leave list (HR / Admin / Supervisor)
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllLeave)
);

// Approve / reject / cancel
router.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(updateLeaveStatus)
);

export default router;
