// backend/src/modules/pim/pimConfig.routes.ts
import { Router } from "express";

import {
  getOptionalFields,
  updateOptionalFields,
  getCustomFields,
  createCustomField,
  deleteCustomField,
  getReportingMethods,
  createReportingMethod,
  updateReportingMethod,
  deleteReportingMethod,
} from "../controllers/pimConfig.controller";

import { requireAuth } from "../../../../middleware/authMiddleware";
import { requireRole } from "../../../../middleware/roleMiddleware";

// 🔥 Import the Termination Reasons Router (YOU MISSED THIS)
import terminationReasonRoutes from "./terminationReasonRoutes";

const router = Router();

/* ===================== OPTIONAL FIELDS ===================== */
router.get(
  "/optional-fields",
  requireAuth,
  requireRole("ADMIN"),
  getOptionalFields
);
router.put(
  "/optional-fields",
  requireAuth,
  requireRole("ADMIN"),
  updateOptionalFields
);

/* ===================== CUSTOM FIELDS ===================== */
router.get(
  "/custom-fields",
  requireAuth,
  requireRole("ADMIN"),
  getCustomFields
);
router.post(
  "/custom-fields",
  requireAuth,
  requireRole("ADMIN"),
  createCustomField
);
router.delete(
  "/custom-fields/:id",
  requireAuth,
  requireRole("ADMIN"),
  deleteCustomField
);

/* ===================== REPORTING METHODS ===================== */
router.get(
  "/reporting-methods",
  requireAuth,
  requireRole("ADMIN"),
  getReportingMethods
);
router.post(
  "/reporting-methods",
  requireAuth,
  requireRole("ADMIN"),
  createReportingMethod
);
router.put(
  "/reporting-methods/:id",
  requireAuth,
  requireRole("ADMIN"),
  updateReportingMethod
);
router.delete(
  "/reporting-methods/:id",
  requireAuth,
  requireRole("ADMIN"),
  deleteReportingMethod
);

/* ===================== TERMINATION REASONS ===================== */
// 🔥 THIS is the missing part causing 404 errors
router.use(
  "/termination-reasons",
  requireAuth,
  requireRole("ADMIN"),
  terminationReasonRoutes
);

export default router;
