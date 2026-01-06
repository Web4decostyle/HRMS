import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

/** Time At Work summary (stub) */
router.get(
  "/time-at-work",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      today: { hours: 0, minutes: 0 },
      week: { hours: 0, minutes: 0 },
      break: { hours: 0, minutes: 0 },
    });
  })
);

/** My Actions (stub) */
router.get(
  "/my-actions",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json([]);
  })
);

/** Employees on leave today (stub) */
router.get(
  "/employees-on-leave-today",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json([]);
  })
);

/** Distribution by location (stub) */
router.get(
  "/distribution/location",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json([]);
  })
);

/** Distribution by subunit (stub) */
router.get(
  "/distribution/subunit",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json([]);
  })
);

export default router;
