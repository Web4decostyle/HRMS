import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";

// Sub-module routers
import jobRoutes from "./job/job.routes";
import salaryRoutes from "./salary/salary.routes";
import taxRoutes from "./tax/tax.routes";
import reportToRoutes from "./reportTo/reportTo.routes";

const router = Router();

/**
 * BASE PATH:  /api/my-info
 *
 * Each sub-module uses:
 * /employees/:employeeId/job
 * /employees/:employeeId/salary
 * /employees/:employeeId/tax
 * /employees/:employeeId/supervisors
 * /employees/:employeeId/subordinates
 */

router.use(requireAuth);

// JOB DETAILS
router.use("/employees/:employeeId/job", jobRoutes);

// SALARY COMPONENTS
router.use("/employees/:employeeId/salary", salaryRoutes);

// TAX EXEMPTIONS
router.use("/employees/:employeeId/tax", taxRoutes);

// REPORT-TO (supervisors + subordinates)
router.use("/employees/:employeeId", reportToRoutes);

export default router;
