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
} from "./division.controller";

const router = Router();

router.use(requireAuth);

// View: ADMIN/HR/SUPERVISOR (so you can show it in dropdowns)
router.get("/", requireRole("ADMIN", "HR", "SUPERVISOR"), asyncHandler(listDivisions));

// Create/Update: ADMIN/HR
router.post("/", requireRole("ADMIN", "HR"), asyncHandler(createDivision));
router.put("/:id", requireRole("ADMIN", "HR"), asyncHandler(updateDivision));

// Delete: ADMIN only
router.delete("/:id", requireRole("ADMIN"), asyncHandler(deleteDivision));

export default router;
