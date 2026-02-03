import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  searchDirectory,
  getEmployeeHierarchy,
  getDivisionsSummary,
} from "./directory.controller";

const router = Router();

router.get("/employees", requireAuth, asyncHandler(searchDirectory));
router.get("/hierarchy/:employeeId", requireAuth, asyncHandler(getEmployeeHierarchy));

// ✅ NEW: divisions summary (used by frontend)
router.get("/divisions-summary", requireAuth, asyncHandler(getDivisionsSummary));

export default router;
