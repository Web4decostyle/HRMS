// backend/src/modules/time/attendance/attendance.routes.ts
import { Router } from "express";
import {
  punchIn,
  punchOut,
  getMyRecordsByDate,
  getMyTodayStatus,
  getMyWeekSummary,
  getMyMonthSummary,
  importMyCsv,
  cleanupMyDuplicates,
} from "./attendance.controller";

// ✅ Use your real auth middleware here:
import { requireAuth } from "../../../middleware/authMiddleware"; 

const router = Router();

router.post("/punch-in", requireAuth, punchIn);
router.post("/punch-out", requireAuth, punchOut);

router.get("/me/records", requireAuth, getMyRecordsByDate);
router.get("/me/today", requireAuth, getMyTodayStatus);
router.get("/me/week", requireAuth, getMyWeekSummary);

// ✅ NEW
router.get("/me/month", requireAuth, getMyMonthSummary);
router.post("/me/import-csv", requireAuth, importMyCsv);
router.delete("/me/cleanup-duplicates", requireAuth, cleanupMyDuplicates);

export default router;
