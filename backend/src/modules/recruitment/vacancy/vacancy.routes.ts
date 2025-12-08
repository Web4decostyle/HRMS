import { Router } from "express";
import { listVacancies, createVacancy } from "./vacancy.controller";
import { requireAuth } from "../../../middleware/authMiddleware";

const router = Router();

router.get("/",  requireAuth,  listVacancies);
router.post("/",  requireAuth,  createVacancy);

export default router;
