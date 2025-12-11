import { Router } from "express";
import {
  listPayGrades,
  createPayGrade,
  updatePayGrade,
  deletePayGrade,
} from "./payGrade.controller";

const router = Router();

// /api/admin/pay-grades
router.get("/", listPayGrades);
router.post("/", createPayGrade);
router.put("/:id", updatePayGrade);     
router.delete("/:id", deletePayGrade);

export default router;
