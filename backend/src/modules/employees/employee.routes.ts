// backend/src/modules/employees/employee.routes.ts
import { Router } from "express";
import {
  listEmployees,
  createEmployee,
  getEmployee,
  getMyEmployee,
  updateEmployee,
  metaByEmployeeIds,
} from "./employee.controller";

import {
  listEmployeeAttachments,
  uploadEmployeeAttachment,
  deleteEmployeeAttachment,
} from "./employeeAttachment.controller";

import { employeeAttachmentUpload } from "./employeeAttachment.upload";

import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { adminOrRequestChange } from "../../middleware/adminOrRequest";
import { asyncHandler } from "../../utils/asyncHandler";
import { updateEmployeeOrg } from "./employee.controller";

const router = Router();
router.use(requireAuth);

// ✅ ESS + ESS_VIEWER only get /me
router.get("/me", asyncHandler(getMyEmployee));

// ✅ Admin/HR/Supervisor can view employees list & profiles
router.get(
  "/",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listEmployees),
);

router.post("/meta-by-ids", asyncHandler(metaByEmployeeIds));

// ✅ Employee Attachments (must be ABOVE "/:id" route)
router.get(
  "/:employeeId/attachments",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listEmployeeAttachments),
);

router.post(
  "/:employeeId/attachments",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  employeeAttachmentUpload.single("file"),
  asyncHandler(uploadEmployeeAttachment),
);

router.delete(
  "/:employeeId/attachments/:attachmentId",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(deleteEmployeeAttachment),
);

router.get(
  "/:id",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(getEmployee),
);

// ✅ Create employee:
// Admin → real create
// HR → request approval
router.post(
  "/",
  adminOrRequestChange({
    module: "EMPLOYEES",
    modelName: "Employee",
    action: "CREATE",
    buildPayload: (req) => req.body,
  }),
  requireRole("ADMIN"), // only admin reaches controller
  asyncHandler(createEmployee),
);

router.patch(
  "/:id/org",
  requireRole("ADMIN", "HR"),
  asyncHandler(updateEmployeeOrg),
);

router.put(
  "/:id",
  adminOrRequestChange({
    module: "EMPLOYEES",
    modelName: "Employee",
    action: "UPDATE",
    getTargetId: (req) => req.params.id,
    buildPayload: (req) => req.body,
  }),
  requireRole("ADMIN"), // only admin reaches controller
  asyncHandler(updateEmployee),
);

export default router;
