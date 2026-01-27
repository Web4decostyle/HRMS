import { Router } from "express";
import {
  createLeaveEntitlement,
  getLeaveEntitlements,
  getMyLeaveEntitlements,
  deleteLeaveEntitlement,
} from "./leaveEntitlement.controller";

import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";

const router = Router();

// /api/leave-entitlements
router.post("/", requireAuth, requireRole("ADMIN", "HR"), createLeaveEntitlement);
router.get("/", requireAuth, requireRole("ADMIN", "HR"), getLeaveEntitlements);
router.get("/my", requireAuth, getMyLeaveEntitlements);
router.delete("/:id", requireAuth, requireRole("ADMIN", "HR"), deleteLeaveEntitlement);

export default router;
