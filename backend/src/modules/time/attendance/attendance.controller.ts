import { Response } from "express";
import mongoose from "mongoose";
import { AttendanceSession } from "./attendance.model";
import { ApiError } from "../../../utils/ApiError";
import { AuthRequest } from "../../../middleware/authMiddleware";
import { AttendanceRegisterEntry } from "./attendanceRegister.model";

/** -------------- helpers -------------- **/

function getUserId(req: any) {
  const id = req?.user?.id || req?.user?._id || req?.userId;
  if (!id) return null;
  return String(id);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// "GMT +05:30"
function tzLabelFromOffsetMinutes(tzOffsetMinutes: number) {
  const sign = tzOffsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(tzOffsetMinutes);
  const hh = pad2(Math.floor(abs / 60));
  const mm = pad2(abs % 60);
  return `GMT ${sign}${hh}:${mm}`;
}

function parseDateTimeToUtc(dateStr: string, timeStr: string, tzOffsetMinutes: number): Date {
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);

  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error("Invalid time format. Expected 'hh:mm AM/PM'.");

  let hh = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3].toUpperCase();

  if (hh < 1 || hh > 12) throw new Error("Invalid hour in time.");
  if (min < 0 || min > 59) throw new Error("Invalid minute in time.");

  if (ampm === "PM" && hh !== 12) hh += 12;
  if (ampm === "AM" && hh === 12) hh = 0;

  const localAsUtcMs = Date.UTC(yyyy, mm - 1, dd, hh, min, 0, 0);
  const utcMs = localAsUtcMs - tzOffsetMinutes * 60 * 1000;

  return new Date(utcMs);
}

function parseTzOffsetMinutes(input: any) {
  const n = Number(input);
  if (!Number.isFinite(n)) return 330;
  return n;
}

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

function safeObjectId(id: string, fieldName = "id") {
  if (!isValidObjectId(id)) throw ApiError.badRequest(`Invalid ${fieldName}`);
  return new mongoose.Types.ObjectId(id);
}

function looksLikeIsoDateTime(v: any) {
  return typeof v === "string" && v.includes("T") && !Number.isNaN(new Date(v).getTime());
}

function parseIsoOrThrow(v: any, field = "date") {
  const d = new Date(String(v));
  if (Number.isNaN(d.getTime())) throw ApiError.badRequest(`Invalid ${field}`);
  return d;
}

function toYmdFromLocalDate(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

function dayLabelFromDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  const dayIdx = d.getUTCDay();
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return names[dayIdx] || "";
}

function computeDurationHours(punchInAt: Date, punchOutAt?: Date | null) {
  if (!punchOutAt) return 0;
  const ms = punchOutAt.getTime() - punchInAt.getTime();
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
}

// -------- register helpers --------

function monthFromYMD(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  return date.slice(0, 7);
}

function monthFromMonthYear(input: any) {
  const y = Number(input?.y);
  const m = Number(input?.m);
  if (!Number.isFinite(y) || !Number.isFinite(m) || y < 1900 || y > 3000 || m < 1 || m > 12) return "";
  return `${y}-${pad2(m)}`;
}

function normalizeEmployeeId(r: any) {
  const cardNo = String(r?.cardNo || "").trim();
  const payrollNo = String(r?.payrollNo || "").trim();
  return cardNo || payrollNo;
}

/** -------------- controllers -------------- **/

// POST /api/time/attendance/punch-in
export async function punchIn(req: AuthRequest, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) throw ApiError.unauthorized("Unauthorized");

  try {
    const { date, time, note, tzOffsetMinutes, punchAt } = (req.body || {}) as any;
    const tz = parseTzOffsetMinutes(tzOffsetMinutes);

    const punchInAt = punchAt
      ? new Date(punchAt)
      : looksLikeIsoDateTime(time)
      ? new Date(time)
      : parseDateTimeToUtc(String(date), String(time), tz);

    if (Number.isNaN(punchInAt.getTime())) {
      return res.status(400).json({ message: "Invalid punchIn time." });
    }

    const open = await AttendanceSession.findOne({
      userId: safeObjectId(userId, "userId"),
      punchOutAt: null,
    }).lean();

    if (open) {
      return res.status(400).json({
        message: "You already have an active Punch In. Please Punch Out first.",
      });
    }

    const session = await AttendanceSession.create({
      userId: safeObjectId(userId, "userId"),
      punchInAt,
      punchInNote: note || "",
      punchOutAt: null,
      punchOutNote: "",
    });

    return res.json({
      punch: {
        _id: String(session._id),
        type: "IN",
        at: session.punchInAt.toISOString(),
        note: session.punchInNote || "",
      },
      message: "Punch In successful",
    });
  } catch (e: any) {
    throw ApiError.badRequest(e?.message || "Punch In failed");
  }
}

// POST /api/time/attendance/punch-out
export async function punchOut(req: AuthRequest, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) throw ApiError.unauthorized("Unauthorized");

  try {
    const { date, time, note, tzOffsetMinutes, punchAt } = (req.body || {}) as any;
    const tz = parseTzOffsetMinutes(tzOffsetMinutes);

    const punchOutAt = punchAt
      ? new Date(punchAt)
      : looksLikeIsoDateTime(time)
      ? new Date(time)
      : parseDateTimeToUtc(String(date), String(time), tz);

    if (Number.isNaN(punchOutAt.getTime())) {
      return res.status(400).json({ message: "Invalid punchOut time." });
    }

    const open = await AttendanceSession.findOne({
      userId: safeObjectId(userId, "userId"),
      punchOutAt: null,
    });

    if (!open) throw ApiError.badRequest("No active Punch In found.");

    if (punchOutAt.getTime() <= open.punchInAt.getTime()) {
      throw ApiError.badRequest("Punch Out must be after Punch In.");
    }

    open.punchOutAt = punchOutAt;
    open.punchOutNote = note || "";
    await open.save();

    return res.json({
      punch: {
        _id: String(open._id),
        type: "OUT",
        at: open.punchOutAt?.toISOString() || punchOutAt.toISOString(),
        note: open.punchOutNote || "",
      },
      message: "Punch Out successful",
    });
  } catch (e: any) {
    throw ApiError.badRequest(e?.message || "Punch Out failed");
  }
}

// GET /api/time/attendance/me/records?date=YYYY-MM-DD&tzOffsetMinutes=330
export async function getMyRecordsByDate(req: AuthRequest, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) throw ApiError.unauthorized("Unauthorized");

  try {
    const date = String(req.query.date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw ApiError.badRequest("date is required as YYYY-MM-DD");
    }

    const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);
    const tzLabel = tzLabelFromOffsetMinutes(tz);

    const startUtc = parseDateTimeToUtc(date, "12:00 AM", tz);
    const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: safeObjectId(userId, "userId"),
      punchInAt: { $gte: startUtc, $lt: endUtc },
    })
      .sort({ punchInAt: 1 })
      .lean();

    const rows = sessions.map((s) => {
      const durationHours = computeDurationHours(s.punchInAt, s.punchOutAt);
      return {
        punchInAt: s.punchInAt.toISOString(),
        punchInNote: s.punchInNote || "",
        punchOutAt: s.punchOutAt ? new Date(s.punchOutAt).toISOString() : null,
        punchOutNote: s.punchOutNote || "",
        durationHours,
        tzLabel,
      };
    });

    const totalDurationHours =
      Math.round(rows.reduce((acc, r) => acc + (r.durationHours || 0), 0) * 100) / 100;

    return res.json({
      date,
      totalDurationHours,
      count: rows.length,
      rows,
    });
  } catch (e: any) {
    throw ApiError.badRequest(e?.message || "Failed to fetch records");
  }
}

// GET /api/time/attendance/me/today
export async function getMyTodayAttendance(req: AuthRequest, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) throw ApiError.unauthorized("Unauthorized");

  const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);

  const nowUtc = new Date();
  const localMs = nowUtc.getTime() + tz * 60 * 1000;
  const local = new Date(localMs);
  const date = toYmdFromLocalDate(local);

  const startUtc = parseDateTimeToUtc(date, "12:00 AM", tz);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

  const sessions = await AttendanceSession.find({
    userId: safeObjectId(userId, "userId"),
    punchInAt: { $gte: startUtc, $lt: endUtc },
  })
    .sort({ punchInAt: 1 })
    .lean();

  const punches: any[] = [];
  let isCurrentlyIn = false;

  for (const s of sessions) {
    punches.push({
      _id: String(s._id) + ":IN",
      type: "IN",
      at: new Date(s.punchInAt).toISOString(),
      note: s.punchInNote || "",
    });

    if (s.punchOutAt) {
      punches.push({
        _id: String(s._id) + ":OUT",
        type: "OUT",
        at: new Date(s.punchOutAt).toISOString(),
        note: s.punchOutNote || "",
      });
    } else {
      isCurrentlyIn = true;
    }
  }

  punches.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  const lastPunchAt = punches.length ? punches[punches.length - 1].at : null;

  return res.json({
    date,
    punches,
    status: isCurrentlyIn ? "IN" : "OUT",
    lastPunchAt,
  });
}

// GET /api/time/attendance/me/week-summary
export async function getMyWeekSummary(req: AuthRequest, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) throw ApiError.unauthorized("Unauthorized");

  try {
    const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);

    const nowUtc = new Date();
    const localMs = nowUtc.getTime() + tz * 60 * 1000;
    const local = new Date(localMs);

    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(local.getTime() - i * 24 * 60 * 60 * 1000);
      days.push(toYmdFromLocalDate(d));
    }

    const startUtc = parseDateTimeToUtc(days[0], "12:00 AM", tz);
    const endUtc = new Date(startUtc.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: safeObjectId(userId, "userId"),
      punchInAt: { $gte: startUtc, $lt: endUtc },
    }).lean();

    const minutesMap: Record<string, number> = {};
    const statusMap: Record<string, "IN" | "OUT"> = {};
    for (const d of days) {
      minutesMap[d] = 0;
      statusMap[d] = "OUT";
    }

    for (const s of sessions) {
      const localPunchMs = new Date(s.punchInAt).getTime() + tz * 60 * 1000;
      const ld = new Date(localPunchMs);
      const dayKey = toYmdFromLocalDate(ld);

      const durHours = computeDurationHours(s.punchInAt, s.punchOutAt);
      const durMinutes = Math.round(durHours * 60);

      if (minutesMap[dayKey] !== undefined) minutesMap[dayKey] += durMinutes;
      if (!s.punchOutAt && statusMap[dayKey] !== undefined) statusMap[dayKey] = "IN";
    }

    const week = days.map((d) => ({
      day: dayLabelFromDate(d),
      date: d,
      totalMinutes: minutesMap[d] || 0,
      status: statusMap[d] || "OUT",
    }));

    return res.json({ week });
  } catch (e: any) {
    throw ApiError.badRequest(e?.message || "Failed to fetch week summary");
  }
}

// --------------------- admin/hr endpoints (AttendanceSession) ---------------------

export async function adminListSessions(req: AuthRequest, res: Response) {
  const { userId, from, to } = req.query as any;

  const filter: any = {};
  if (userId) filter.userId = safeObjectId(String(userId), "userId");
  if (from || to) {
    filter.punchInAt = {};
    if (from) filter.punchInAt.$gte = parseIsoOrThrow(from, "from");
    if (to) filter.punchInAt.$lte = parseIsoOrThrow(to, "to");
  }

  const items = await AttendanceSession.find(filter).sort({ punchInAt: -1 }).lean();
  res.json(items);
}

export async function adminGetUserRecordsByDate(req: AuthRequest, res: Response) {
  const userId = String((req.query as any).userId || "");
  if (!userId) throw ApiError.badRequest("userId is required");

  const date = String(req.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw ApiError.badRequest("date is required as YYYY-MM-DD");
  }

  const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);
  const tzLabel = tzLabelFromOffsetMinutes(tz);

  const startUtc = parseDateTimeToUtc(date, "12:00 AM", tz);
  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

  const sessions = await AttendanceSession.find({
    userId: safeObjectId(userId, "userId"),
    punchInAt: { $gte: startUtc, $lt: endUtc },
  })
    .sort({ punchInAt: 1 })
    .lean();

  const rows = sessions.map((s) => {
    const durationHours = computeDurationHours(s.punchInAt, s.punchOutAt);
    return {
      sessionId: String(s._id),
      punchInAt: s.punchInAt.toISOString(),
      punchInNote: s.punchInNote || "",
      punchOutAt: s.punchOutAt ? new Date(s.punchOutAt).toISOString() : null,
      punchOutNote: s.punchOutNote || "",
      durationHours,
      tzLabel,
    };
  });

  const totalDurationHours =
    Math.round(rows.reduce((acc, r) => acc + (r.durationHours || 0), 0) * 100) / 100;

  res.json({
    userId,
    date,
    totalDurationHours,
    count: rows.length,
    rows,
  });
}

export async function adminCreateSession(req: AuthRequest, res: Response) {
  const { userId, punchInAt, punchOutAt, punchInNote, punchOutNote } = (req.body || {}) as any;
  if (!userId) throw ApiError.badRequest("userId is required");
  if (!punchInAt) throw ApiError.badRequest("punchInAt is required");

  const inAt = parseIsoOrThrow(punchInAt, "punchInAt");
  const outAt = punchOutAt ? parseIsoOrThrow(punchOutAt, "punchOutAt") : null;

  if (outAt && outAt.getTime() <= inAt.getTime()) {
    throw ApiError.badRequest("punchOutAt must be after punchInAt");
  }

  const open = await AttendanceSession.findOne({
    userId: safeObjectId(String(userId), "userId"),
    punchOutAt: null,
  }).lean();

  if (open && !outAt) {
    throw ApiError.badRequest("User already has an open attendance session");
  }

  const doc = await AttendanceSession.create({
    userId: safeObjectId(String(userId), "userId"),
    punchInAt: inAt,
    punchInNote: String(punchInNote || ""),
    punchOutAt: outAt,
    punchOutNote: String(punchOutNote || ""),
  });

  res.status(201).json(doc);
}

export async function adminUpdateSession(req: AuthRequest, res: Response) {
  const id = String(req.params.id || "");
  if (!id) throw ApiError.badRequest("Missing session id");

  const patch: any = {};
  if (req.body?.punchInAt !== undefined)
    patch.punchInAt = parseIsoOrThrow(req.body.punchInAt, "punchInAt");
  if (req.body?.punchOutAt !== undefined) {
    patch.punchOutAt = req.body.punchOutAt
      ? parseIsoOrThrow(req.body.punchOutAt, "punchOutAt")
      : null;
  }
  if (req.body?.punchInNote !== undefined) patch.punchInNote = String(req.body.punchInNote || "");
  if (req.body?.punchOutNote !== undefined) patch.punchOutNote = String(req.body.punchOutNote || "");

  const existing = await AttendanceSession.findById(safeObjectId(id, "id"));
  if (!existing) throw ApiError.notFound("Attendance session not found");

  const newInAt = patch.punchInAt ?? existing.punchInAt;
  const newOutAt = patch.punchOutAt !== undefined ? patch.punchOutAt : existing.punchOutAt;

  if (newOutAt && newOutAt.getTime() <= newInAt.getTime()) {
    throw ApiError.badRequest("punchOutAt must be after punchInAt");
  }

  Object.assign(existing, patch);
  await existing.save();

  res.json(existing);
}

export async function adminDeleteSession(req: AuthRequest, res: Response) {
  const id = String(req.params.id || "");
  if (!id) throw ApiError.badRequest("Missing session id");

  const deleted = await AttendanceSession.findByIdAndDelete(safeObjectId(id, "id"));
  if (!deleted) throw ApiError.notFound("Attendance session not found");

  res.json({ message: "Deleted" });
}

// --------------------- ✅ Attendance Register (Excel Import) ---------------------

// POST /api/time/attendance/bulk-import
export async function bulkImportAttendanceRegister(req: AuthRequest, res: Response) {
  const authUserId = getUserId(req as any);
  if (!authUserId) throw ApiError.unauthorized("Unauthorized");

  const { monthYear, records } = (req.body || {}) as any;

  if (!Array.isArray(records) || records.length === 0) {
    throw ApiError.badRequest("records[] is required");
  }

  const payloadMonth = monthFromMonthYear(monthYear);

  let accepted = 0;
  let rejected = 0;

  const ops: any[] = [];

  for (const r of records) {
    const date = String(r?.date || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      rejected++;
      continue;
    }

    const employeeId = normalizeEmployeeId(r);
    if (!employeeId) {
      rejected++;
      continue;
    }

    const month = payloadMonth || monthFromYMD(date);
    if (!month) {
      rejected++;
      continue;
    }

    const doc = {
      employeeId,
      payrollNo: r?.payrollNo ? String(r.payrollNo).trim() : undefined,
      cardNo: r?.cardNo ? String(r.cardNo).trim() : undefined,
      employeeName: r?.employeeName ? String(r.employeeName).trim() : undefined,
      date,
      inTime: r?.inTime ? String(r.inTime).trim() : undefined,
      outTime: r?.outTime ? String(r.outTime).trim() : undefined,
      status: r?.status ? String(r.status).trim() : undefined,
      month,
      importedBy: safeObjectId(authUserId, "userId"),
    };

    ops.push({
      updateOne: {
        filter: { employeeId, date },
        update: { $set: doc },
        upsert: true,
      },
    });

    accepted++;
  }

  if (ops.length === 0) throw ApiError.badRequest("No valid rows to import");

  // unordered lets it continue if some rows have duplicate problems
  const result = await AttendanceRegisterEntry.bulkWrite(ops, { ordered: false });

  res.json({
    message: "Bulk import completed",
    month: payloadMonth || undefined,
    accepted,
    rejected,
    inserted: result.upsertedCount,
    modified: result.modifiedCount,
    matched: result.matchedCount,
  });
}

// GET /api/time/attendance/register?month=YYYY-MM&q=...&employeeId=...
export async function getAttendanceRegister(req: AuthRequest, res: Response) {
  const month = String((req.query as any).month || "").trim();
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw ApiError.badRequest("month is required as YYYY-MM");
  }

  const employeeId = String((req.query as any).employeeId || "").trim();
  const q = String((req.query as any).q || "").trim();

  const filter: any = { month };
  if (employeeId) filter.employeeId = employeeId;
  if (q) {
    filter.$or = [
      { employeeId: new RegExp(q, "i") },
      { payrollNo: new RegExp(q, "i") },
      { cardNo: new RegExp(q, "i") },
      { employeeName: new RegExp(q, "i") },
    ];
  }

  const items = await AttendanceRegisterEntry.find(filter)
    .sort({ employeeId: 1, date: 1 })
    .lean();

  res.json(items);
}

// PATCH /api/time/attendance/register/:id
export async function updateAttendanceRegisterEntry(req: AuthRequest, res: Response) {
  const id = String(req.params.id || "").trim();
  if (!id) throw ApiError.badRequest("Missing id");

  const patch: any = {};
  if (req.body?.inTime !== undefined) patch.inTime = req.body.inTime ? String(req.body.inTime).trim() : "";
  if (req.body?.outTime !== undefined) patch.outTime = req.body.outTime ? String(req.body.outTime).trim() : "";
  if (req.body?.status !== undefined) patch.status = req.body.status ? String(req.body.status).trim() : "";
  if (req.body?.employeeName !== undefined)
    patch.employeeName = req.body.employeeName ? String(req.body.employeeName).trim() : "";

  const updated = await AttendanceRegisterEntry.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
  if (!updated) throw ApiError.notFound("Register entry not found");

  res.json(updated);
}