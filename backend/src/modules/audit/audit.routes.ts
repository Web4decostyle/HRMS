import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { listAuditLogs } from "./audit.controller";

const router = Router();

router.get("/", requireAuth, requireRole("ADMIN"), listAuditLogs);

export default router;
