import { Router } from "express";
import { listJobTitles, createJobTitle } from "./jobTitle.controller";
import { uploadJobSpec } from "../../../../middleware/uploadJobSpec";
// import { requireAdmin } from "../../../middleware/auth"; // if you have it

const router = Router();

router.get("/", /* requireAdmin, */ listJobTitles);
router.post(
  "/",
  /* requireAdmin, */
  uploadJobSpec.single("specFile"),
  createJobTitle
);

export default router;
