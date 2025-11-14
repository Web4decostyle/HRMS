// backend/src/modules/performance/performance.routes.ts
import { Router } from "express";
import {
  createPerformanceReview,
  listPerformanceReviews,
  listEmployeeReviews,
  updateReviewStatus,
} from "./performance.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post(
  "/reviews",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(createPerformanceReview)
);

router.get(
  "/reviews",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listPerformanceReviews)
);

router.get(
  "/reviews/employee/:employeeId",
  requireAuth,
  asyncHandler(listEmployeeReviews)
);

router.patch(
  "/reviews/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateReviewStatus)
);

export default router;
