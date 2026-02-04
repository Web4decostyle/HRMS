// backend/src/modules/divisions/subDivision.routes.ts
import { Router } from "express";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listSubDivisions,
  createSubDivision,
  updateSubDivision,
  deleteSubDivision,
} from "./subDivision.controller";

const router = Router({ mergeParams: true });

// View: ADMIN/HR/SUPERVISOR
router.get(
  "/",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listSubDivisions),
);

// Create/Update: ADMIN/HR
router.post(
  "/",
  requireRole("ADMIN", "HR"),
  asyncHandler(createSubDivision),
);
router.put(
  "/:id",
  requireRole("ADMIN", "HR"),
  asyncHandler(updateSubDivision),
);

// Delete: ADMIN only
router.delete(
  "/:id",
  requireRole("ADMIN"),
  asyncHandler(deleteSubDivision),
);

export default router;
