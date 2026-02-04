// backend/src/modules/divisions/division.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listDivisions,
  createDivision,
  updateDivision,
  deleteDivision,
  getDivisionOrgChart,
} from "./division.controller";
import subDivisionRouter from "./subDivision.routes";

const router = Router();

router.use(requireAuth);

// Nested: /api/divisions/:divisionId/sub-divisions
router.use("/:divisionId/sub-divisions", subDivisionRouter);

// View: ADMIN/HR/SUPERVISOR (so you can show it in dropdowns)
router.get(
  "/",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listDivisions),
);

// Create/Update: ADMIN/HR
router.post("/", requireRole("ADMIN", "HR"), asyncHandler(createDivision));
router.put("/:id", requireRole("ADMIN", "HR"), asyncHandler(updateDivision));

// Delete: ADMIN only
router.delete("/:id", requireRole("ADMIN"), asyncHandler(deleteDivision));

router.get(
  "/:id/org-chart",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(getDivisionOrgChart),
);

export default router;
