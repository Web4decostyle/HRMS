import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  requestApproval,
  approveReject,
} from "./approval.controller";
import { myPendingApprovals } from "./approval.query.controller";

const router = Router();

router.post("/", requireAuth, asyncHandler(requestApproval));
router.post("/:id/action", requireAuth, asyncHandler(approveReject));

// ✅ NEW
router.get("/my-pending", requireAuth, asyncHandler(myPendingApprovals));

export default router;
