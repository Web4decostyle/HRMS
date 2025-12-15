import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
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

router.get("/", asyncHandler(listBuzz));
router.post("/", asyncHandler(createBuzz));

router.post("/:id/like", asyncHandler(toggleLike));

router.post("/:id/reshare", asyncHandler(resharePost));

router.get("/:id/comments", asyncHandler(listComments));
router.post("/:id/comments", asyncHandler(addComment));

router.patch("/:id", asyncHandler(updateBuzzPost));
router.delete("/:id", asyncHandler(deleteBuzzPost));

router.patch("/:id/comments/:commentId", asyncHandler(updateBuzzComment));
router.delete("/:id/comments/:commentId", asyncHandler(deleteBuzzComment));

router.post("/upload", buzzUpload.array("files", 6), asyncHandler(uploadMedia));

export default router;
