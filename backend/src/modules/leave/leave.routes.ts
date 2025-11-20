// backend/src/modules/leave/leave.routes.ts
import { Router } from "express";
import {
  listLeaveTypes,
  createLeaveType,
  createLeaveRequest,
  listAllLeave,
  listMyLeave,
  updateLeaveStatus,
} from "./leave.controller";
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

// Employee requests
router.post("/", requireAuth, asyncHandler(createLeaveRequest));

// My leave (logged-in employee)
router.get("/my", requireAuth, asyncHandler(listMyLeave));

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
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateLeaveStatus)
);

export default router;
