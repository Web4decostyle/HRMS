import { Router } from "express";
import multer from "multer";

import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminOrRequestChange } from "../../middleware/adminOrRequest";

import {
  listEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
  listDependents,
  createDependent,
  deleteDependent,
  listEducation,
  createEducation,
  deleteEducation,
  listWorkExperience,
  createWorkExperience,
  deleteWorkExperience,
} from "./pim.controller";

import {
  importEmployeesCsv,
  downloadPimSampleCsv,
} from "./pimConfig/controllers/pimImport.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
});

/* ===================== Emergency Contacts ===================== */

router.get(
  "/employees/:employeeId/emergency-contacts",
  requireAuth,
  asyncHandler(listEmergencyContacts)
);

router.post(
  "/employees/:employeeId/emergency-contacts",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "EmergencyContact",
    action: "CREATE",
    buildPayload: (req) => ({
      employee: req.params.employeeId,
      ...req.body,
    }),
  }),
  asyncHandler(createEmergencyContact)
);

router.delete(
  "/employees/:employeeId/emergency-contacts/:id",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "EmergencyContact",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  asyncHandler(deleteEmergencyContact)
);

/* ===================== Dependents ===================== */

router.get(
  "/employees/:employeeId/dependents",
  requireAuth,
  asyncHandler(listDependents)
);

router.post(
  "/employees/:employeeId/dependents",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "Dependent",
    action: "CREATE",
    buildPayload: (req) => ({
      employee: req.params.employeeId,
      ...req.body,
    }),
  }),
  asyncHandler(createDependent)
);

router.delete(
  "/employees/:employeeId/dependents/:id",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "Dependent",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  asyncHandler(deleteDependent)
);

/* ===================== Education ===================== */

router.get(
  "/employees/:employeeId/education",
  requireAuth,
  asyncHandler(listEducation)
);

router.post(
  "/employees/:employeeId/education",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "Education",
    action: "CREATE",
    buildPayload: (req) => ({
      employee: req.params.employeeId,
      ...req.body,
    }),
  }),
  asyncHandler(createEducation)
);

router.delete(
  "/employees/:employeeId/education/:id",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "Education",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  asyncHandler(deleteEducation)
);

/* ===================== Work Experience ===================== */

router.get(
  "/employees/:employeeId/experience",
  requireAuth,
  asyncHandler(listWorkExperience)
);

router.post(
  "/employees/:employeeId/experience",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "WorkExperience",
    action: "CREATE",
    buildPayload: (req) => ({
      employee: req.params.employeeId,
      ...req.body,
    }),
  }),
  asyncHandler(createWorkExperience)
);

router.delete(
  "/employees/:employeeId/experience/:id",
  requireAuth,
  adminOrRequestChange({
    module: "PIM",
    modelName: "WorkExperience",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  asyncHandler(deleteWorkExperience)
);

/* ===================== PIM Data Import ===================== */

// sample CSV
router.get(
  "/import/sample",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(downloadPimSampleCsv)
);

// CSV upload
router.post(
  "/import",
  requireAuth,
  requireRole("ADMIN", "HR"),
  upload.single("file"),
  asyncHandler(importEmployeesCsv)
);

export default router;
