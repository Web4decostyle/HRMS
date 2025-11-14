// backend/src/modules/maintenance/maintenance.routes.ts
import { Router } from "express";
import { getSystemInfo } from "./maintenance.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/maintenance/system-info
router.get(
  "/system-info",
  requireAuth,
  requireRole("ADMIN"),
  asyncHandler(getSystemInfo)
);

export default router;
