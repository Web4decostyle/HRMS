// backend/src/modules/employees/employee.routes.ts
import { Router } from "express";
import {
  listEmployees,
  createEmployee,
  getEmployee,
  getMyEmployee,
  updateEmployee,
} from "./employee.controller";

import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { adminOrRequestChange } from "../../middleware/adminOrRequest";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();
router.use(requireAuth);

// ✅ ESS + ESS_VIEWER only get /me
router.get("/me", asyncHandler(getMyEmployee));

// ✅ Admin/HR/Supervisor can view employees list & profiles
router.get("/", requireRole("ADMIN", "HR", "SUPERVISOR"), asyncHandler(listEmployees));
router.get("/:id", requireRole("ADMIN", "HR", "SUPERVISOR"), asyncHandler(getEmployee));

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
  asyncHandler(createEmployee)
);

// ✅ Update employee:
// Admin → apply directly
// HR → request approval
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
  asyncHandler(updateEmployee)
);

export default router;
