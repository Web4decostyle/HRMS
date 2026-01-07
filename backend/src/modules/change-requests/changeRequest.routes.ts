import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listMyChangeRequests,
  listPendingChangeRequests,
  approveChangeRequest,
  rejectChangeRequest,
} from "./changeRequest.controller";

const router = Router();

router.get("/mine", requireAuth, asyncHandler(listMyChangeRequests));

router.get("/pending", requireAuth, asyncHandler(listPendingChangeRequests));
router.post("/:id/approve", requireAuth, asyncHandler(approveChangeRequest));
router.post("/:id/reject", requireAuth, asyncHandler(rejectChangeRequest));

export default router;
