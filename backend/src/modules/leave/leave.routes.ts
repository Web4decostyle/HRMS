// backend/src/modules/leave/leave.routes.ts
import { Router } from "express";
import {
  listLeaveTypes,
  createLeaveType,
  createLeaveRequest,
  listAllLeave,
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

// Leave requests
router.post("/", requireAuth, asyncHandler(createLeaveRequest));

router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllLeave)
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateLeaveStatus)
);

export default router;
