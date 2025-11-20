import { Router } from "express";
import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";
import { getTax, upsertTax } from "./tax.controller";

const router = Router({ mergeParams: true });

// GET tax record
router.get("/", requireAuth, getTax);

// Create or update tax record
router.put(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR"), // Employees cannot edit tax info
  upsertTax
);

export default router;
