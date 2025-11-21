import { Router } from "express";
import {
  createLeaveEntitlement,
  getLeaveEntitlements,
  getMyLeaveEntitlements,
  deleteLeaveEntitlement,
} from "./leaveEntitlement.controller";

import { requireAuth } from "../../../middleware/authMiddleware";

const router = Router();

// /api/leave-entitlements
router.post("/", requireAuth, createLeaveEntitlement);
router.get("/", requireAuth, getLeaveEntitlements);
router.get("/my", requireAuth, getMyLeaveEntitlements);
router.delete("/:id", requireAuth, deleteLeaveEntitlement);

export default router;