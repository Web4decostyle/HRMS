import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

/** Time At Work summary (stub) */
router.get(
  "/time-at-work",
  requireAuth,
  asyncHandler(async (_req, res) => {
    // Keep it simple but match what the current widget can consume (week array)
    res.json({
      week: [],
    });
  })
);

/** My Actions (stub) */
router.get(
  "/my-actions",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      pendingLeaveApprovals: 0,
      pendingTimesheets: 0,
      pendingClaims: 0,
    });
  })
);

/** Employees on leave today (stub) */
router.get(
  "/employees-on-leave-today",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(async (_req, res) => {
    res.json({ total: 0 });
  })
);

/** Distribution by location (stub) */
router.get(
  "/distribution/location",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(async (_req, res) => {
    res.json([]);
  })
);

/** Distribution by subunit (stub) */
router.get(
  "/distribution/subunit",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(async (_req, res) => {
    res.json([]);
  })
);

export default router;