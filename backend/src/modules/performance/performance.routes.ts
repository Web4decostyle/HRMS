// backend/src/modules/performance/performance.routes.ts
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

const router = Router();

// TODO: plug your auth middleware here, e.g.:
// router.use(requireAuth);

/* ===== Configure → KPIs ===== */
router.get("/kpis", listKpis);
router.post("/kpis", createKpi);
router.put("/kpis/:id", updateKpi);
router.delete("/kpis/:id", deleteKpi);

/* ===== Configure → Trackers ===== */
router.get("/trackers", listTrackers);
router.post("/trackers", createTracker);
router.put("/trackers/:id", updateTracker);
router.delete("/trackers/:id", deleteTracker);

/* My Trackers & Employee Trackers top tabs */
router.get("/trackers/my", listMyTrackers);
router.get("/trackers/me-as-employee", listEmployeeTrackers);

/* ===== Manage Reviews dropdown ===== */
// Main manage list with filters (admin view)
router.get("/reviews", listReviews);
// CRUD
router.post("/reviews", createReview);
router.get("/reviews/:id", getReviewById);
router.put("/reviews/:id", updateReview);
router.delete("/reviews/:id", deleteReview);

// My Reviews (logged-in employee is subject)
router.get("/reviews/my", listMyReviews);

// Employee Reviews (logged-in user is reviewer)
router.get("/reviews/as-reviewer", listEmployeeReviews);

export default router;
