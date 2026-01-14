import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  searchDirectory,
  getEmployeeHierarchy,
  getDepartmentsSummary,
} from "./directory.controller";

const router = Router();

router.get("/employees", requireAuth, asyncHandler(searchDirectory));
router.get("/hierarchy/:employeeId", requireAuth, asyncHandler(getEmployeeHierarchy));

// ✅ NEW
router.get(
  "/departments-summary",
  requireAuth,
  asyncHandler(getDepartmentsSummary)
);

export default router;
