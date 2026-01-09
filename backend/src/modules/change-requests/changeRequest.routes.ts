// backend/src/modules/change-requests/changeRequest.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listMyChangeRequests,
  listPendingChangeRequests,
  listHistoryChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
} from "./changeRequest.controller";

const router = Router();

router.get("/mine", requireAuth, asyncHandler(listMyChangeRequests));

// Admin
router.get("/pending", requireAuth, asyncHandler(listPendingChangeRequests));
router.get("/history", requireAuth, asyncHandler(listHistoryChangeRequests));

router.post("/:id/approve", requireAuth, asyncHandler(approveChangeRequest));
router.post("/:id/reject", requireAuth, asyncHandler(rejectChangeRequest));

export default router;
