import { Router } from "express";
import { listVacancies, createVacancy } from "./vacancy.controller";
import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";

const router = Router();

// HR/Admin/Supervisor can view vacancies
router.get("/", requireAuth, requireRole("ADMIN", "HR", "SUPERVISOR"), listVacancies);

// Only HR/Admin can create vacancies
router.post("/", requireAuth, requireRole("ADMIN", "HR"), createVacancy);

export default router;
