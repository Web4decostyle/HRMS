import { Router } from "express";
import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/roleMiddleware";
import {
  listPimReports,
  getPimReport,
  createPimReport,
  updatePimReport,
  deletePimReport,
} from "./pimReport.controller";

const router = Router();

// let Admin + HR manage reports; adjust roles as you like
router.use(requireAuth, requireRole("ADMIN", "HR"));

router.get("/", listPimReports);
router.get("/:id", getPimReport);
router.post("/", createPimReport);
router.put("/:id", updatePimReport);
router.delete("/:id", deletePimReport);

export default router;
