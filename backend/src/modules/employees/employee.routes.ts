import { Router } from "express";
import { listEmployees, createEmployee, getEmployee } from "./employee.controller";

const router = Router();

router.get("/", listEmployees);
router.post("/", createEmployee);
router.get("/:id", getEmployee);

export default router;
