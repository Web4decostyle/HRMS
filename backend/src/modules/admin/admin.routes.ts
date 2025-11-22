// backend/src/modules/admin/admin.routes.ts
import { Router } from "express";
import {
  listOrgUnits,
  createOrgUnit,
  updateOrgUnit,
  deleteOrgUnit,
  listJobTitles,
  createJobTitle,
  updateJobTitle,
  deleteJobTitle,
  listPayGrades,
  createPayGrade,
  updatePayGrade,
  deletePayGrade,
  listEmploymentStatuses,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus,
  listJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
  listWorkShifts,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift,
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getGeneralInfo,
  upsertGeneralInfo,
  listSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  listEducationLevels,
  createEducationLevel,
  updateEducationLevel,
  deleteEducationLevel,
  listLanguages,
  createLanguage,
  updateLanguage,
  deleteLanguage,
  listLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
  listNationalities,
  createNationality,
  updateNationality,
  deleteNationality,
} from "./admin.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  listSystemUsers,
  createSystemUser,
  updateSystemUserStatus,
  deleteSystemUser,
} from "./systemUsers/systemUsers.controller";

const router = Router();

// All admin routes require ADMIN or HR
const withAuth = [requireAuth, requireRole("ADMIN", "HR")] as const;

/* -------- Org Units -------- */

router.get(
  "/org-units",
  ...withAuth,
  asyncHandler(listOrgUnits)
);
router.post(
  "/org-units",
  ...withAuth,
  asyncHandler(createOrgUnit)
);
router.put(
  "/org-units/:id",
  ...withAuth,
  asyncHandler(updateOrgUnit)
);
router.delete(
  "/org-units/:id",
  ...withAuth,
  asyncHandler(deleteOrgUnit)
);

/* -------- Job Titles -------- */

router.get(
  "/job-titles",
  ...withAuth,
  asyncHandler(listJobTitles)
);
router.post(
  "/job-titles",
  ...withAuth,
  asyncHandler(createJobTitle)
);
router.put(
  "/job-titles/:id",
  ...withAuth,
  asyncHandler(updateJobTitle)
);
router.delete(
  "/job-titles/:id",
  ...withAuth,
  asyncHandler(deleteJobTitle)
);

/* -------- Pay Grades -------- */

router.get(
  "/pay-grades",
  ...withAuth,
  asyncHandler(listPayGrades)
);
router.post(
  "/pay-grades",
  ...withAuth,
  asyncHandler(createPayGrade)
);
router.put(
  "/pay-grades/:id",
  ...withAuth,
  asyncHandler(updatePayGrade)
);
router.delete(
  "/pay-grades/:id",
  ...withAuth,
  asyncHandler(deletePayGrade)
);

/* -------- Employment Status -------- */

router.get(
  "/employment-statuses",
  ...withAuth,
  asyncHandler(listEmploymentStatuses)
);
router.post(
  "/employment-statuses",
  ...withAuth,
  asyncHandler(createEmploymentStatus)
);
router.put(
  "/employment-statuses/:id",
  ...withAuth,
  asyncHandler(updateEmploymentStatus)
);
router.delete(
  "/employment-statuses/:id",
  ...withAuth,
  asyncHandler(deleteEmploymentStatus)
);

/* -------- Job Categories -------- */

router.get(
  "/job-categories",
  ...withAuth,
  asyncHandler(listJobCategories)
);
router.post(
  "/job-categories",
  ...withAuth,
  asyncHandler(createJobCategory)
);
router.put(
  "/job-categories/:id",
  ...withAuth,
  asyncHandler(updateJobCategory)
);
router.delete(
  "/job-categories/:id",
  ...withAuth,
  asyncHandler(deleteJobCategory)
);

/* -------- Work Shifts -------- */

router.get(
  "/work-shifts",
  ...withAuth,
  asyncHandler(listWorkShifts)
);
router.post(
  "/work-shifts",
  ...withAuth,
  asyncHandler(createWorkShift)
);
router.put(
  "/work-shifts/:id",
  ...withAuth,
  asyncHandler(updateWorkShift)
);
router.delete(
  "/work-shifts/:id",
  ...withAuth,
  asyncHandler(deleteWorkShift)
);

/* -------- Locations -------- */

router.get(
  "/locations",
  ...withAuth,
  asyncHandler(listLocations)
);
router.post(
  "/locations",
  ...withAuth,
  asyncHandler(createLocation)
);
router.put(
  "/locations/:id",
  ...withAuth,
  asyncHandler(updateLocation)
);
router.delete(
  "/locations/:id",
  ...withAuth,
  asyncHandler(deleteLocation)
);

/* -------- Organization: General Info -------- */

router.get(
  "/organization/general-info",
  ...withAuth,
  asyncHandler(getGeneralInfo)
);
router.put(
  "/organization/general-info",
  ...withAuth,
  asyncHandler(upsertGeneralInfo)
);

/* -------- Qualifications: Skills -------- */

router.get(
  "/qualifications/skills",
  ...withAuth,
  asyncHandler(listSkills)
);
router.post(
  "/qualifications/skills",
  ...withAuth,
  asyncHandler(createSkill)
);
router.put(
  "/qualifications/skills/:id",
  ...withAuth,
  asyncHandler(updateSkill)
);
router.delete(
  "/qualifications/skills/:id",
  ...withAuth,
  asyncHandler(deleteSkill)
);

/* -------- Qualifications: Education -------- */

router.get(
  "/qualifications/education",
  ...withAuth,
  asyncHandler(listEducationLevels)
);
router.post(
  "/qualifications/education",
  ...withAuth,
  asyncHandler(createEducationLevel)
);
router.put(
  "/qualifications/education/:id",
  ...withAuth,
  asyncHandler(updateEducationLevel)
);
router.delete(
  "/qualifications/education/:id",
  ...withAuth,
  asyncHandler(deleteEducationLevel)
);

/* -------- Qualifications: Languages -------- */

router.get(
  "/qualifications/languages",
  ...withAuth,
  asyncHandler(listLanguages)
);
router.post(
  "/qualifications/languages",
  ...withAuth,
  asyncHandler(createLanguage)
);
router.put(
  "/qualifications/languages/:id",
  ...withAuth,
  asyncHandler(updateLanguage)
);
router.delete(
  "/qualifications/languages/:id",
  ...withAuth,
  asyncHandler(deleteLanguage)
);

/* -------- Qualifications: Licenses -------- */

router.get(
  "/qualifications/licenses",
  ...withAuth,
  asyncHandler(listLicenses)
);
router.post(
  "/qualifications/licenses",
  ...withAuth,
  asyncHandler(createLicense)
);
router.put(
  "/qualifications/licenses/:id",
  ...withAuth,
  asyncHandler(updateLicense)
);
router.delete(
  "/qualifications/licenses/:id",
  ...withAuth,
  asyncHandler(deleteLicense)
);

/* -------- Nationalities -------- */

router.get(
  "/nationalities",
  ...withAuth,
  asyncHandler(listNationalities)
);
router.post(
  "/nationalities",
  ...withAuth,
  asyncHandler(createNationality)
);
router.put(
  "/nationalities/:id",
  ...withAuth,
  asyncHandler(updateNationality)
);
router.delete(
  "/nationalities/:id",
  ...withAuth,
  asyncHandler(deleteNationality)
);

/* -------- System Users -------- */

router.get(
  "/system-users",
  ...withAuth,
  asyncHandler(listSystemUsers)
);
router.post(
  "/system-users",
  ...withAuth,
  asyncHandler(createSystemUser)
);
router.patch(
  "/system-users/:id/status",
  ...withAuth,
  asyncHandler(updateSystemUserStatus)
);
router.delete(
  "/system-users/:id",
  ...withAuth,
  asyncHandler(deleteSystemUser)
);

export default router;
