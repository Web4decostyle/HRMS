// backend/src/modules/claim/claim.routes.ts
import { Router } from "express";
import {
  listClaimTypes,
  createClaimType,
  submitClaim,
  listMyClaims,
  listAllClaims,
  updateClaimStatus,
} from "./claim.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// Types
router.get(
  "/types",
  requireAuth,
  asyncHandler(listClaimTypes)
);
router.post(
  "/types",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createClaimType)
);

// Requests
router.post("/", requireAuth, asyncHandler(submitClaim));
router.get("/my", requireAuth, asyncHandler(listMyClaims));
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllClaims)
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateClaimStatus)
);

export default router;
