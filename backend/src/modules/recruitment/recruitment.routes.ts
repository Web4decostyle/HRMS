// backend/src/modules/recruitment/recruitment.routes.ts
import { Router } from "express";
import {
  createJob,
  listJobs,
  getJob,
  createCandidate,
  listCandidates,
  updateCandidateStatus,
} from "./recruitment.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Jobs
router.post(
  "/jobs",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createJob)
);

router.get(
  "/jobs",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listJobs)
);

router.get(
  "/jobs/:id",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(getJob)
);

// Candidates
router.post(
  "/candidates",
  requireAuth,
  asyncHandler(createCandidate) // candidates can apply without HR role
);

router.get(
  "/candidates",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listCandidates)
);

router.patch(
  "/candidates/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateCandidateStatus)
);

export default router;
