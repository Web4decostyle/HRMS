import { Router } from "express";
import {
  listJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
} from "./jobCategory.controller";

const router = Router();

// /api/admin/job-categories
router.get("/", listJobCategories);
router.post("/", createJobCategory);
router.put("/:id", updateJobCategory);
router.delete("/:id", deleteJobCategory);

export default router;
