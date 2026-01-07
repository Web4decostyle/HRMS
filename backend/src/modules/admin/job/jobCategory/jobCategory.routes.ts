import { Router } from "express";
import {
  listJobCategories,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
} from "./jobCategory.controller";

import { requireAuth } from "../../../../middleware/authMiddleware";
import { adminOrRequestChange } from "../../../../middleware/adminOrRequest";

const router = Router();

// /api/admin/job-categories

// ✅ Everyone logged in can read
router.get("/", requireAuth, listJobCategories);

// ✅ Admin: direct create
// ✅ HR: Change Request
router.post(
  "/",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "JobCategory",
    action: "CREATE",
    buildPayload: (req) => ({ ...req.body }),
  }),
  createJobCategory
);

// ✅ Admin: direct update
// ✅ HR: Change Request
router.put(
  "/:id",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "JobCategory",
    action: "UPDATE",
    getTargetId: (req) => req.params.id,
    buildPayload: (req) => ({ ...req.body }),
  }),
  updateJobCategory
);

// ✅ Admin: direct delete
// ✅ HR: Change Request
router.delete(
  "/:id",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "JobCategory",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  deleteJobCategory
);

export default router;
