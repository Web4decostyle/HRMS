import { Router } from "express";
import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";
import {
  listSalary,
  createSalary,
  deleteSalary,
} from "./salary.controller";

const router = Router({ mergeParams: true });

// GET /api/my-info/employees/:employeeId/salary
router.get("/", requireAuth, listSalary);

// POST /api/my-info/employees/:employeeId/salary
router.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "HR"), // Only HR/Admin can add salary components
  createSalary
);

// DELETE /api/my-info/employees/:employeeId/salary/:salaryId
router.delete(
  "/:salaryId",
  requireAuth,
  requireRole("ADMIN", "HR"),
  deleteSalary
);

export default router;
