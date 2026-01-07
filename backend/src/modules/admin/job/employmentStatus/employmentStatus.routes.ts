import { Router } from "express";
import {
  listEmploymentStatuses,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus,
} from "./employmentStatus.controller";

import { requireAuth } from "../../../../middleware/authMiddleware";
import { adminOrRequestChange } from "../../../../middleware/adminOrRequest";

const router = Router();

// ✅ Everyone logged in can read
router.get("/", requireAuth, listEmploymentStatuses);

// ✅ Admin: direct create
// ✅ HR: Change Request
router.post(
  "/",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "EmploymentStatus",
    action: "CREATE",
    buildPayload: (req) => ({ ...req.body }),
  }),
  createEmploymentStatus
);

// ✅ Admin: direct update
// ✅ HR: Change Request
router.put(
  "/:id",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "EmploymentStatus",
    action: "UPDATE",
    getTargetId: (req) => req.params.id,
    buildPayload: (req) => ({ ...req.body }),
  }),
  updateEmploymentStatus
);

// ✅ Admin: direct delete
// ✅ HR: Change Request
router.delete(
  "/:id",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "EmploymentStatus",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  deleteEmploymentStatus
);

export default router;
