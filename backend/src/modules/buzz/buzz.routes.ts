// backend/src/modules/buzz/buzz.routes.ts
import { Router } from "express";
import {
  createBuzzPost,
  listBuzzPosts,
  likeBuzzPost,
  commentOnBuzzPost,
} from "./buzz.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/posts", requireAuth, asyncHandler(createBuzzPost));
router.get("/posts", requireAuth, asyncHandler(listBuzzPosts));
router.post("/posts/:id/like", requireAuth, asyncHandler(likeBuzzPost));
router.post("/posts/:id/comment", requireAuth, asyncHandler(commentOnBuzzPost));

export default router;
