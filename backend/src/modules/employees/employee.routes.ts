import { Router } from "express";
import { listEmployees, createEmployee, getEmployee, getMyEmployee, updateEmployee, } from "./employee.controller";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", listEmployees);
router.get("/me", getMyEmployee);
router.post("/", createEmployee);
router.get("/:id", getEmployee);
router.put("/:id", updateEmployee);

export default router;
