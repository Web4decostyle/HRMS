import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  addComment,
  createBuzz,
  listBuzz,
  listComments,
  resharePost,
  toggleLike,
  uploadMedia,
  updateBuzzPost,
  deleteBuzzPost,
  updateBuzzComment,
  deleteBuzzComment,
} from "./buzz.controller";
import { buzzUpload } from "./buzz.upload";

const router = Router();

router.use(requireAuth);

// Everyone authenticated can view
router.get("/", asyncHandler(listBuzz));
router.get("/:id/comments", asyncHandler(listComments));

// Only ADMIN / HR can create post
router.post("/", requireRole("ADMIN", "HR"), asyncHandler(createBuzz));

// Everyone authenticated can like
router.post("/:id/like", asyncHandler(toggleLike));

// Only ADMIN / HR can reshare
router.post("/:id/reshare", requireRole("ADMIN", "HR"), asyncHandler(resharePost));

// Only ADMIN / HR can comment
router.post("/:id/comments", requireRole("ADMIN", "HR"), asyncHandler(addComment));

// Only ADMIN / HR can edit/delete their own posts
router.patch("/:id", requireRole("ADMIN", "HR"), asyncHandler(updateBuzzPost));
router.delete("/:id", requireRole("ADMIN", "HR"), asyncHandler(deleteBuzzPost));

// Only ADMIN / HR can edit/delete their own comments
router.patch(
  "/:id/comments/:commentId",
  requireRole("ADMIN", "HR"),
  asyncHandler(updateBuzzComment)
);
router.delete(
  "/:id/comments/:commentId",
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteBuzzComment)
);

// Only ADMIN / HR can upload media
router.post(
  "/upload",
  requireRole("ADMIN", "HR"),
  buzzUpload.array("files", 6),
  asyncHandler(uploadMedia)
);

export default router;