import { Router } from "express";
import {
  punchIn,
  punchOut,
  getMyRecordsByDate,
  getMyTodayStatus,
  getMyWeekSummary,
} from "./attendance.controller";

// ✅ Use your existing auth middleware here
// Example: import { requireAuth } from "../../middleware/requireAuth";
const requireAuth = (req: any, _res: any, next: any) => next();

const router = Router();

router.post("/punch-in", requireAuth, punchIn);
router.post("/punch-out", requireAuth, punchOut);

router.get("/me/records", requireAuth, getMyRecordsByDate);
router.get("/me/today", requireAuth, getMyTodayStatus);
router.get("/me/week", requireAuth, getMyWeekSummary);

export default router;
