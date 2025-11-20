import { Router } from "express";
import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";
import { getJob, upsertJob } from "./job.controller";

const router = Router({ mergeParams: true });

// GET /api/my-info/employees/:employeeId/job
router.get("/", requireAuth, getJob);

// PUT /api/my-info/employees/:employeeId/job
router.put(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR"), // employees cannot edit job details
  upsertJob
);

export default router;
