import { Router } from "express";
import {
  listPayGrades,
  createPayGrade,
  updatePayGrade,
  deletePayGrade,
} from "./payGrade.controller";

import { requireAuth } from "../../../../middleware/authMiddleware";
import { adminOrRequestChange } from "../../../../middleware/adminOrRequest";

const router = Router();

// /api/admin/pay-grades

// ✅ Everyone logged in can read
router.get("/", requireAuth, listPayGrades);

// ✅ Admin: direct create
// ✅ HR: submits Change Request (202)
// ❌ others: forbidden
router.post(
  "/",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "PayGrade",
    action: "CREATE",
    buildPayload: (req) => ({ ...req.body }),
  }),
  createPayGrade
);

// ✅ Admin: direct update
// ✅ HR: Change Request
router.put(
  "/:id",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "PayGrade",
    action: "UPDATE",
    getTargetId: (req) => req.params.id,
    buildPayload: (req) => ({ ...req.body }),
  }),
  updatePayGrade
);

// ✅ Admin: direct delete
// ✅ HR: Change Request
router.delete(
  "/:id",
  requireAuth,
  adminOrRequestChange({
    module: "ADMIN_JOB",
    modelName: "PayGrade",
    action: "DELETE",
    getTargetId: (req) => req.params.id,
  }),
  deletePayGrade
);

export default router;
