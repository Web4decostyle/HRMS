// backend/src/modules/pim/pim.routes.ts
import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
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
import multer from "multer";
import { importEmployeesCsv, downloadPimSampleCsv } from "./pimConfig/controllers/pimImport.controller";


const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 }, 
});

// Emergency contacts
router.get(
  "/employees/:employeeId/emergency-contacts",
  requireAuth,
  asyncHandler(listEmergencyContacts)
);
router.post(
  "/employees/:employeeId/emergency-contacts",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createEmergencyContact)
);
router.delete(
  "/employees/:employeeId/emergency-contacts/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteEmergencyContact)
);

// Dependents
router.get(
  "/employees/:employeeId/dependents",
  requireAuth,
  asyncHandler(listDependents)
);
router.post(
  "/employees/:employeeId/dependents",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createDependent)
);
router.delete(
  "/employees/:employeeId/dependents/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteDependent)
);

// Education
router.get(
  "/employees/:employeeId/education",
  requireAuth,
  asyncHandler(listEducation)
);
router.post(
  "/employees/:employeeId/education",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createEducation)
);
router.delete(
  "/employees/:employeeId/education/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteEducation)
);

// Work experience
router.get(
  "/employees/:employeeId/experience",
  requireAuth,
  asyncHandler(listWorkExperience)
);
router.post(
  "/employees/:employeeId/experience",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(createWorkExperience)
);
router.delete(
  "/employees/:employeeId/experience/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(deleteWorkExperience)
);

// ================= PIM Data Import =================

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