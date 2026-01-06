import { Request, Response } from "express";
import mongoose from "mongoose";
import { AttendanceSession } from "./attendance.model";

/** -------------- helpers -------------- **/

function getUserId(req: any) {
  // supports: req.user._id, req.user.id, req.userId
  const id =
    req?.user?._id ||
    req?.user?.id ||
    req?.userId;

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

/**
 * Convert a local date+time -> UTC Date using tzOffsetMinutes.
 * tzOffsetMinutes = minutes ahead of UTC (India = 330)
 *
 * Example:
 * local "2026-01-06" + "03:37 PM" in GMT+05:30
 * => UTC Date = local minus offset
 */
function parseDateTimeToUtc(dateStr: string, timeStr: string, tzOffsetMinutes: number): Date {
  // dateStr: YYYY-MM-DD
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);

  // timeStr: "hh:mm AM" or "hh:mm PM"
  const m = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error("Invalid time format. Expected 'hh:mm AM/PM'.");

  let hh = Number(m[1]);
  const min = Number(m[2]);
  const ampm = m[3].toUpperCase();

  if (hh < 1 || hh > 12) throw new Error("Invalid hour in time.");
  if (min < 0 || min > 59) throw new Error("Invalid minute in time.");

  if (ampm === "PM" && hh !== 12) hh += 12;
  if (ampm === "AM" && hh === 12) hh = 0;

  // Create a "local" timestamp as if it were UTC, then subtract tzOffset to get real UTC
  const localAsUtcMs = Date.UTC(yyyy, (mm - 1), dd, hh, min, 0, 0);
  const utcMs = localAsUtcMs - tzOffsetMinutes * 60 * 1000;

  return new Date(utcMs);
}

function parseTzOffsetMinutes(input: any) {
  const n = Number(input);
  // if not provided, default to India to match your UI screenshot time zone
  if (!Number.isFinite(n)) return 330;
  return n;
}

function computeDurationHours(punchInAt: Date, punchOutAt?: Date | null) {
  if (!punchOutAt) return 0;
  const ms = punchOutAt.getTime() - punchInAt.getTime();
  if (ms <= 0) return 0;
  return Math.round((ms / (1000 * 60 * 60)) * 100) / 100; // 2 decimals
}

/** -------------- controllers -------------- **/

// POST /api/time/attendance/punch-in
export async function punchIn(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { date, time, note, tzOffsetMinutes, punchAt } = req.body || {};

    const tz = parseTzOffsetMinutes(tzOffsetMinutes);

    // Allow either punchAt (ISO) OR date+time
    const punchInAt = punchAt
      ? new Date(punchAt)
      : parseDateTimeToUtc(String(date), String(time), tz);

    if (Number.isNaN(punchInAt.getTime())) {
      return res.status(400).json({ message: "Invalid punchIn time." });
    }

    // Prevent multiple open sessions
    const open = await AttendanceSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      punchOutAt: null,
    }).lean();

    if (open) {
      return res.status(400).json({
        message: "You already have an active Punch In. Please Punch Out first.",
      });
    }

    const session = await AttendanceSession.create({
      userId,
      punchInAt,
      punchInNote: note || "",
      punchOutAt: null,
      punchOutNote: "",
    });

    return res.json({
      message: "Punch In successful",
      session: {
        id: session._id,
        punchInAt: session.punchInAt,
        punchInNote: session.punchInNote,
        tzLabel: tzLabelFromOffsetMinutes(tz),
      },
    });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Punch In failed" });
  }
}

// POST /api/time/attendance/punch-out
export async function punchOut(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { date, time, note, tzOffsetMinutes, punchAt } = req.body || {};
    const tz = parseTzOffsetMinutes(tzOffsetMinutes);

    const punchOutAt = punchAt
      ? new Date(punchAt)
      : parseDateTimeToUtc(String(date), String(time), tz);

    if (Number.isNaN(punchOutAt.getTime())) {
      return res.status(400).json({ message: "Invalid punchOut time." });
    }

    const open = await AttendanceSession.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      punchOutAt: null,
    });

    if (!open) {
      return res.status(400).json({ message: "No active Punch In found." });
    }

    // validate punch out after punch in
    if (punchOutAt.getTime() <= open.punchInAt.getTime()) {
      return res.status(400).json({ message: "Punch Out must be after Punch In." });
    }

    open.punchOutAt = punchOutAt;
    open.punchOutNote = note || "";
    await open.save();

    return res.json({
      message: "Punch Out successful",
      session: {
        id: open._id,
        punchInAt: open.punchInAt,
        punchOutAt: open.punchOutAt,
        durationHours: computeDurationHours(open.punchInAt, open.punchOutAt),
        tzLabel: tzLabelFromOffsetMinutes(tz),
      },
    });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Punch Out failed" });
  }
}

// GET /api/time/attendance/me/records?date=YYYY-MM-DD&tzOffsetMinutes=330
export async function getMyRecordsByDate(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const date = String(req.query.date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date is required as YYYY-MM-DD" });
    }

    const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);
    const tzLabel = tzLabelFromOffsetMinutes(tz);

    // Compute UTC start/end for that local day
    const startUtc = parseDateTimeToUtc(date, "12:00 AM", tz);
    const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: new mongoose.Types.ObjectId(userId),
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

    const totalDurationHours = Math.round(
      rows.reduce((acc, r) => acc + (r.durationHours || 0), 0) * 100
    ) / 100;

    return res.json({
      date,
      totalDurationHours,
      count: rows.length,
      rows,
    });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to fetch records" });
  }
}

// GET /api/time/attendance/me/today?tzOffsetMinutes=330
export async function getMyTodayStatus(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);

  // local today date from tz
  const nowUtc = new Date();
  const localMs = nowUtc.getTime() + tz * 60 * 1000;
  const local = new Date(localMs);

  const yyyy = local.getUTCFullYear();
  const mm = pad2(local.getUTCMonth() + 1);
  const dd = pad2(local.getUTCDate());
  const date = `${yyyy}-${mm}-${dd}`;

  // reuse records logic
  req.query.date = date;
  return getMyRecordsByDate(req, res);
}

// GET /api/time/attendance/me/week?tzOffsetMinutes=330
// returns a stable shape: { week: [...] } (so week.map works)
export async function getMyWeekSummary(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);

    // Determine local "today"
    const nowUtc = new Date();
    const localMs = nowUtc.getTime() + tz * 60 * 1000;
    const local = new Date(localMs);

    // build last 7 days (including today) in local
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(local.getTime() - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getUTCFullYear();
      const mm = pad2(d.getUTCMonth() + 1);
      const dd = pad2(d.getUTCDate());
      days.push(`${yyyy}-${mm}-${dd}`);
    }

    // fetch all sessions covering that local range
    const startUtc = parseDateTimeToUtc(days[0], "12:00 AM", tz);
    const endUtc = new Date(startUtc.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      punchInAt: { $gte: startUtc, $lt: endUtc },
    }).lean();

    // accumulate per day
    const map: Record<string, number> = {};
    for (const d of days) map[d] = 0;

    for (const s of sessions) {
      // convert punchInAt UTC -> local date string
      const localPunchMs = new Date(s.punchInAt).getTime() + tz * 60 * 1000;
      const ld = new Date(localPunchMs);
      const yyyy = ld.getUTCFullYear();
      const mm = pad2(ld.getUTCMonth() + 1);
      const dd = pad2(ld.getUTCDate());
      const dayKey = `${yyyy}-${mm}-${dd}`;

      const dur = computeDurationHours(s.punchInAt, s.punchOutAt);
      if (map[dayKey] !== undefined) map[dayKey] += dur;
    }

    const week = days.map((d) => ({
      date: d,
      durationHours: Math.round((map[d] || 0) * 100) / 100,
    }));

    return res.json({ week }); // ✅ always array
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to fetch week summary" });
  }
}
