// backend/src/modules/time/timesheet.routes.ts
import { Router } from "express";
import {
  createTimesheet,
  listMyTimesheets,
  listAllTimesheets,
  getTimesheetById,
  updateTimesheetStatus,
} from "./timesheet.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Employee own timesheets
router.post("/", requireAuth, asyncHandler(createTimesheet));
router.get("/my", requireAuth, asyncHandler(listMyTimesheets));
router.get("/:id", requireAuth, asyncHandler(getTimesheetById));

// Admin / HR / Supervisor
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllTimesheets)
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateTimesheetStatus)
);

export default router;