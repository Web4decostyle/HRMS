import { Router } from "express";
import {
  listEmployees,
  createEmployee,
  getEmployee,
  getMyEmployee,
  updateEmployee,
  updateEmployeeOrg,
  bulkImportEmployees,
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

const router = Router();
router.use(requireAuth);

router.get("/me", asyncHandler(getMyEmployee));

router.get("/", requireRole("ADMIN", "HR", "SUPERVISOR"), asyncHandler(listEmployees));

router.post(
  "/bulk-import",
  requireRole("ADMIN"),
  asyncHandler(bulkImportEmployees)
);

router.get(
  "/:employeeId/attachments",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(listEmployeeAttachments)
);

router.post(
  "/:employeeId/attachments",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  employeeAttachmentUpload.single("file"),
  asyncHandler(uploadEmployeeAttachment)
);

router.delete(
  "/:employeeId/attachments/:attachmentId",
  requireRole("ADMIN", "HR", "SUPERVISOR"),
  asyncHandler(deleteEmployeeAttachment)
);

router.get("/:id", requireRole("ADMIN", "HR", "SUPERVISOR"), asyncHandler(getEmployee));

router.post(
  "/",
  adminOrRequestChange({
    module: "EMPLOYEES",
    modelName: "Employee",
    action: "CREATE",
    buildPayload: (req) => req.body,
  }),
  requireRole("ADMIN"),
  asyncHandler(createEmployee)
);

router.patch(
  "/:id/org",
  requireRole("ADMIN", "HR"),
  asyncHandler(updateEmployeeOrg)
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
  requireRole("ADMIN"),
  asyncHandler(updateEmployee)
);

export default router;