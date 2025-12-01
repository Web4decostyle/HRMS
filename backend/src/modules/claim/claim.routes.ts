// backend/src/modules/claim/claim.routes.ts
import { Router } from "express";
import {
  listClaimTypes,
  createClaimType,
  submitClaim,
  assignClaim,
  listMyClaims,
  listAllClaims,
  updateClaimStatus,
} from "./claim.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

/* ------------------------- Claim Types ------------------------- */

router.get("/types", requireAuth, asyncHandler(listClaimTypes));

router.post(
  "/types",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createClaimType)
);

/* ------------------------ Claim Requests ----------------------- */

// Employee submits own claim
router.post("/", requireAuth, asyncHandler(submitClaim));

// HR/Admin assigns claim to employee
router.post(
  "/assign",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(assignClaim)
);

// My Claims (employee)
router.get("/my", requireAuth, asyncHandler(listMyClaims));

// Employee Claims (HR/Admin)
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listAllClaims)
);

// Update status (approve / reject)
router.patch(
  "/:id/status",
  requireAuth,
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(updateClaimStatus)
);

export default router;
