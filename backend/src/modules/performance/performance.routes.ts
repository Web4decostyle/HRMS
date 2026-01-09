import { Router } from "express";
import {
  listKpis,
  createKpi,
  updateKpi,
  deleteKpi,
  listTrackers,
  createTracker,
  updateTracker,
  deleteTracker,
  listMyTrackers,
  listEmployeeTrackers,
  listReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  listMyReviews,
  listEmployeeReviews,
} from "./performance.controller";

import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// ✅ All performance endpoints require login
router.use(requireAuth);

/* ===== Configure → KPIs ===== */
router.get("/kpis", requireRole("ADMIN", "HR"), asyncHandler(listKpis));
router.post("/kpis", requireRole("ADMIN", "HR"), asyncHandler(createKpi));
router.put("/kpis/:id", requireRole("ADMIN", "HR"), asyncHandler(updateKpi));
router.delete("/kpis/:id", requireRole("ADMIN", "HR"), asyncHandler(deleteKpi));

/* ===== Configure → Trackers ===== */
router.get("/trackers", requireRole("ADMIN", "HR"), asyncHandler(listTrackers));
router.post("/trackers", requireRole("ADMIN", "HR"), asyncHandler(createTracker));
router.put("/trackers/:id", requireRole("ADMIN", "HR"), asyncHandler(updateTracker));
router.delete("/trackers/:id", requireRole("ADMIN", "HR"), asyncHandler(deleteTracker));

/* My Trackers & Employee Trackers top tabs */
router.get("/trackers/my", asyncHandler(listMyTrackers));
router.get(
  "/trackers/me-as-employee",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listEmployeeTrackers)
);

/* ===== Manage Reviews dropdown ===== */
router.get("/reviews", requireRole("ADMIN", "HR"), asyncHandler(listReviews));
router.post("/reviews", requireRole("ADMIN", "HR"), asyncHandler(createReview));
router.get(
  "/reviews/:id",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(getReviewById)
);
router.put("/reviews/:id", requireRole("ADMIN", "HR"), asyncHandler(updateReview));
router.delete("/reviews/:id", requireRole("ADMIN", "HR"), asyncHandler(deleteReview));

router.get("/reviews/my", asyncHandler(listMyReviews));

router.get(
  "/reviews/as-reviewer",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listEmployeeReviews)
);

export default router;
