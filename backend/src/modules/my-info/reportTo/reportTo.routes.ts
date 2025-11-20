import { Router } from "express";
import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";

import {
  listSupervisors,
  addSupervisor,
  deleteSupervisor,
  listSubordinates,
  addSubordinate,
  deleteSubordinate,
} from "./reportTo.controller";

const router = Router({ mergeParams: true });

/**
 * BASE PATH: /api/my-info/employees/:employeeId/
 */

// SUPERVISORS
router.get("/supervisors", requireAuth, listSupervisors);

router.post(
  "/supervisors",
  requireAuth,
  requireRole("ADMIN", "HR"),
  addSupervisor
);

router.delete(
  "/supervisors/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  deleteSupervisor
);

// SUBORDINATES
router.get("/subordinates", requireAuth, listSubordinates);

router.post(
  "/subordinates",
  requireAuth,
  requireRole("ADMIN", "HR"),
  addSubordinate
);

router.delete(
  "/subordinates/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  deleteSubordinate
);

export default router;
