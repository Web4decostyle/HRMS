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

const router = Router();

router.use(requireAuth);

// 🔹 put /me before /:id
router.get("/me", getMyEmployee);
router.get("/", listEmployees);
router.post("/", createEmployee);
router.get("/:id", getEmployee);
router.put("/:id", updateEmployee);

export default router;
