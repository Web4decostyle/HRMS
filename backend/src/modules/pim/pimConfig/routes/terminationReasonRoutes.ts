// backend/src/modules/pim/config/routes/terminationReasonRoutes.ts
import { Router } from "express";
import {
  listTerminationReasons,
  createTerminationReason,
  updateTerminationReason,
  deleteTerminationReason,
} from "../controllers/terminationReasonController";
import { requireAuth } from "../../../../middleware/authMiddleware";
import { requireRole } from "../../../../middleware/requireRole"; 

const router = Router();

// Only ADMIN + HR can touch termination reasons (adjust as you like)
router.use(requireAuth, requireRole("ADMIN", "HR"));

router.get("/", listTerminationReasons);
router.post("/", createTerminationReason);
router.put("/:id", updateTerminationReason);
router.delete("/:id", deleteTerminationReason);

export default router;
