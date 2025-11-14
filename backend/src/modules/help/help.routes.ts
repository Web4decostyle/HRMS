// backend/src/modules/help/help.routes.ts
import { Router } from "express";
import { getHelpTopics } from "./help.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/help/topics
router.get("/topics", requireAuth, asyncHandler(getHelpTopics));

export default router;
