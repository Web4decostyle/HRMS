import { Router } from "express";
import {
  listEmploymentStatuses,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus,
} from "./employmentStatus.controller";
// import { requireAuth, requireAdmin } from "../../../middleware/auth";

const router = Router();

// List & create
router.get("/", /* requireAuth, requireAdmin, */ listEmploymentStatuses);
router.post("/", /* requireAuth, requireAdmin, */ createEmploymentStatus);

// Update & delete
router.put("/:id", /* requireAuth, requireAdmin, */ updateEmploymentStatus);
router.delete("/:id", /* requireAuth, requireAdmin, */ deleteEmploymentStatus);

export default router;
