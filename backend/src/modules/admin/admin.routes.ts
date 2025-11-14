// backend/src/modules/admin/admin.routes.ts
import { Router } from "express";
import {
  listOrgUnits,
  createOrgUnit,
  listJobTitles,
  createJobTitle,
  listPayGrades,
  createPayGrade,
  listLocations,
  createLocation,
} from "./admin.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Org Units
router.get(
  "/org-units",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(listOrgUnits)
);
router.post(
  "/org-units",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createOrgUnit)
);

// Job Titles
router.get(
  "/job-titles",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(listJobTitles)
);
router.post(
  "/job-titles",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createJobTitle)
);

// Pay Grades
router.get(
  "/pay-grades",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(listPayGrades)
);
router.post(
  "/pay-grades",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createPayGrade)
);

// Locations
router.get(
  "/locations",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(listLocations)
);
router.post(
  "/locations",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createLocation)
);

export default router;
