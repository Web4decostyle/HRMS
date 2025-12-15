import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { requireMaintenanceAccess } from "../../middleware/requireMaintenance";
import { verifyMaintenance } from "./maintenance.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { getSystemInfo } from "./maintenance.controller";

const router = Router();

/* Step-up verification */
router.post(
  "/verify",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(verifyMaintenance)
);

/* Page-protected routes */
router.get(
  "/system-info",
  requireAuth,
  requireRole("ADMIN"),
  requireMaintenanceAccess("system-info"),
  asyncHandler(getSystemInfo)
);

export default router;
