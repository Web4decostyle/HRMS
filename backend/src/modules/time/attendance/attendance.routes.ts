import { Router } from "express";
import {
  punchIn,
  punchOut,
  getMyRecordsByDate,
  getMyTodayAttendance,
  getMyWeekSummary,
  getMyMonthSummary,
  // admin/hr (attendance session management)
  adminCreateSession,
  adminUpdateSession,
  adminDeleteSession,
  adminGetUserRecordsByDate,
  adminListSessions,
  // ✅ register (excel matrix import)
  bulkImportAttendanceRegister,
  getAttendanceRegister,
  updateAttendanceRegisterEntry,
  getMyAttendanceRegister,
} from "./attendance.controller";

import { requireAuth } from "../../../middleware/authMiddleware";
import { requireRole } from "../../../middleware/requireRole";
import { asyncHandler } from "../../../utils/asyncHandler";

const router = Router();

// --------------------- employee self-service ---------------------
router.post("/punch-in", requireAuth, asyncHandler(punchIn));
router.post("/punch-out", requireAuth, asyncHandler(punchOut));

router.get("/me/records", requireAuth, asyncHandler(getMyRecordsByDate));
router.get("/me/today", requireAuth, asyncHandler(getMyTodayAttendance));
router.get("/me/month", requireAuth, asyncHandler(getMyMonthSummary));
router.get("/me/register", requireAuth, asyncHandler(getMyAttendanceRegister));

// keep both for backward compatibility
router.get("/me/week", requireAuth, asyncHandler(getMyWeekSummary));
router.get("/me/week-summary", requireAuth, asyncHandler(getMyWeekSummary));

// --------------------- admin/hr attendance session management ---------------------
router.get(
  "/admin/sessions",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(adminListSessions)
);

router.get(
  "/admin/records",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(adminGetUserRecordsByDate)
);

router.post(
  "/admin/sessions",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(adminCreateSession)
);

router.patch(
  "/admin/sessions/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(adminUpdateSession)
);

router.delete(
  "/admin/sessions/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(adminDeleteSession)
);

// --------------------- ✅ Attendance Register (Excel import) ---------------------
// This is what your EmployeeAttendanceRecords.tsx calls:
router.post(
  "/bulk-import",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(bulkImportAttendanceRegister)
);

// Fetch stored register month-wise
router.get(
  "/register",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(getAttendanceRegister)
);

// Edit a row (Admin/HR only)
router.patch(
  "/register/:id",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(updateAttendanceRegisterEntry)
);

export default router;