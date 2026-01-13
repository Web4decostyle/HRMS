import { Router } from "express";
import { getAuditHistory } from "./audit.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";

const router = Router();

// ✅ FINAL URL: GET /api/audit?limit=500&module=...&entity=...&action=...&q=...
router.get("/", requireAuth, requireRole("ADMIN"), getAuditHistory);

export default router;
