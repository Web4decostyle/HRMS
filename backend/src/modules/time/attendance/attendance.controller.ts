// backend/src/modules/time/attendance/attendance.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { AttendanceSession } from "./attendance.model";

/** -------------- helpers -------------- **/

function getUserId(req: any) {
  const id = req?.user?._id || req?.user?.id || req?.userId;
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
 */
function parseDateTimeToUtc(dateStr: string, timeStr: string, tzOffsetMinutes: number): Date {
  const [yyyy, mm, dd] = dateStr.split("-").map(Number);

  // Accept BOTH:
  // 1) "hh:mm AM/PM"
  // 2) "HH:MM" (24h)
  const t = timeStr.trim();

  let hh: number | null = null;
  let min: number | null = null;

  const m12 = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (m12) {
    hh = Number(m12[1]);
    min = Number(m12[2]);
    const ampm = m12[3].toUpperCase();

    if (hh < 1 || hh > 12) throw new Error("Invalid hour in time.");
    if (min < 0 || min > 59) throw new Error("Invalid minute in time.");

    if (ampm === "PM" && hh !== 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;
  } else {
    const m24 = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!m24) throw new Error("Invalid time format. Use 'HH:MM' or 'hh:mm AM/PM'.");
    hh = Number(m24[1]);
    min = Number(m24[2]);
    if (hh < 0 || hh > 23) throw new Error("Invalid hour in time.");
    if (min < 0 || min > 59) throw new Error("Invalid minute in time.");
  }

  const localAsUtcMs = Date.UTC(yyyy, mm - 1, dd, hh!, min!, 0, 0);
  const utcMs = localAsUtcMs - tzOffsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

function parseTzOffsetMinutes(input: any) {
  const n = Number(input);
  if (!Number.isFinite(n)) return 330; // default India like your UI
  return n;
}

function computeDurationMinutes(punchInAt: Date, punchOutAt?: Date | null) {
  if (!punchOutAt) return 0;
  const ms = punchOutAt.getTime() - punchInAt.getTime();
  if (ms <= 0) return 0;
  return Math.floor(ms / (1000 * 60));
}

function utcToLocalDayKey(utcDate: Date, tzOffsetMinutes: number) {
  const localMs = utcDate.getTime() + tzOffsetMinutes * 60 * 1000;
  const d = new Date(localMs);
  const yyyy = d.getUTCFullYear();
  const mm = pad2(d.getUTCMonth() + 1);
  const dd = pad2(d.getUTCDate());
  return `${yyyy}-${mm}-${dd}`;
}

/** -------------- controllers -------------- **/

// POST /api/time/attendance/punch-in
export async function punchIn(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { date, time, note, tzOffsetMinutes, punchAt } = req.body || {};
    const tz = parseTzOffsetMinutes(tzOffsetMinutes);

    const punchInAt = punchAt
      ? new Date(punchAt)
      : parseDateTimeToUtc(String(date), String(time), tz);

    if (Number.isNaN(punchInAt.getTime())) {
      return res.status(400).json({ message: "Invalid punchIn time." });
    }

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
        durationMinutes: computeDurationMinutes(open.punchInAt, open.punchOutAt),
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

    const startUtc = parseDateTimeToUtc(date, "12:00 AM", tz);
    const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      punchInAt: { $gte: startUtc, $lt: endUtc },
    })
      .sort({ punchInAt: 1 })
      .lean();

    const rows = sessions.map((s) => {
      const durationMinutes = computeDurationMinutes(s.punchInAt, s.punchOutAt);
      return {
        punchInAt: s.punchInAt.toISOString(),
        punchInNote: s.punchInNote || "",
        punchOutAt: s.punchOutAt ? new Date(s.punchOutAt).toISOString() : null,
        punchOutNote: s.punchOutNote || "",
        durationMinutes,
        tzLabel,
      };
    });

    const totalMinutes = rows.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);

    return res.json({
      date,
      totalMinutes,
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

  const nowUtc = new Date();
  const localMs = nowUtc.getTime() + tz * 60 * 1000;
  const local = new Date(localMs);

  const yyyy = local.getUTCFullYear();
  const mm = pad2(local.getUTCMonth() + 1);
  const dd = pad2(local.getUTCDate());
  const date = `${yyyy}-${mm}-${dd}`;

  req.query.date = date;
  return getMyRecordsByDate(req, res);
}

// GET /api/time/attendance/me/week?tzOffsetMinutes=330
export async function getMyWeekSummary(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);

    const nowUtc = new Date();
    const localMs = nowUtc.getTime() + tz * 60 * 1000;
    const local = new Date(localMs);

    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(local.getTime() - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getUTCFullYear();
      const mm = pad2(d.getUTCMonth() + 1);
      const dd = pad2(d.getUTCDate());
      days.push(`${yyyy}-${mm}-${dd}`);
    }

    const startUtc = parseDateTimeToUtc(days[0], "12:00 AM", tz);
    const endUtc = new Date(startUtc.getTime() + 7 * 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      punchInAt: { $gte: startUtc, $lt: endUtc },
    }).lean();

    const map: Record<string, number> = {};
    for (const d of days) map[d] = 0;

    for (const s of sessions) {
      const dayKey = utcToLocalDayKey(new Date(s.punchInAt), tz);
      const durMin = computeDurationMinutes(s.punchInAt, s.punchOutAt);
      if (map[dayKey] !== undefined) map[dayKey] += durMin;
    }

    const week = days.map((d) => ({
      date: d,
      totalMinutes: map[d] || 0,
    }));

    return res.json({ week });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to fetch week summary" });
  }
}

/**
 * ✅ NEW
 * GET /api/time/attendance/me/month?from=YYYY-MM-DD&to=YYYY-MM-DD&tzOffsetMinutes=330
 * returns:
 * { from, to, days: [{date, totalMinutes, firstInAt, lastOutAt}] }
 */
export async function getMyMonthSummary(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const from = String(req.query.from || "");
    const to = String(req.query.to || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res.status(400).json({ message: "from and to are required as YYYY-MM-DD" });
    }

    const tz = parseTzOffsetMinutes(req.query.tzOffsetMinutes);

    const startUtc = parseDateTimeToUtc(from, "12:00 AM", tz);
    const endUtcExclusive = new Date(parseDateTimeToUtc(to, "12:00 AM", tz).getTime() + 24 * 60 * 60 * 1000);

    const sessions = await AttendanceSession.find({
      userId: new mongoose.Types.ObjectId(userId),
      punchInAt: { $gte: startUtc, $lt: endUtcExclusive },
    }).lean();

    const map = new Map<
      string,
      { totalMinutes: number; firstInAt: string | null; lastOutAt: string | null }
    >();

    for (const s of sessions) {
      const dayKey = utcToLocalDayKey(new Date(s.punchInAt), tz);
      const durMin = computeDurationMinutes(s.punchInAt, s.punchOutAt);

      const existing = map.get(dayKey) || { totalMinutes: 0, firstInAt: null, lastOutAt: null };

      existing.totalMinutes += durMin;

      const inIso = new Date(s.punchInAt).toISOString();
      if (!existing.firstInAt || new Date(inIso).getTime() < new Date(existing.firstInAt).getTime()) {
        existing.firstInAt = inIso;
      }

      if (s.punchOutAt) {
        const outIso = new Date(s.punchOutAt).toISOString();
        if (!existing.lastOutAt || new Date(outIso).getTime() > new Date(existing.lastOutAt).getTime()) {
          existing.lastOutAt = outIso;
        }
      }

      map.set(dayKey, existing);
    }

    const days = Array.from(map.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json({ from, to, tzLabel: tzLabelFromOffsetMinutes(tz), days });
  } catch (e: any) {
    return res.status(400).json({ message: e?.message || "Failed to fetch month summary" });
  }
}


export async function importMyCsv(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { rows, tzOffsetMinutes } = req.body || {};
    const tz = parseTzOffsetMinutes(tzOffsetMinutes);

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "rows array is required" });
    }

    const uid = new mongoose.Types.ObjectId(userId);

    let accepted = 0;
    let rejected = 0;

    const ops: any[] = [];

    for (const r of rows) {
      const date = String(r?.date || "").slice(0, 10);
      const inTime = String(r?.inTime || "").trim();
      const outTime = String(r?.outTime || "").trim();
      const note = String(r?.note || "").trim();

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !inTime) {
        rejected++;
        continue;
      }

      let punchInAt: Date;
      let punchOutAt: Date | null = null;

      try {
        punchInAt = parseDateTimeToUtc(date, inTime, tz);
        if (outTime) punchOutAt = parseDateTimeToUtc(date, outTime, tz);
      } catch {
        rejected++;
        continue;
      }

      if (Number.isNaN(punchInAt.getTime())) {
        rejected++;
        continue;
      }

      if (punchOutAt && punchOutAt.getTime() <= punchInAt.getTime()) {
        rejected++;
        continue;
      }

      // ✅ UPSERT by (userId, punchInAt) so repeated imports don't duplicate
      ops.push({
        updateOne: {
          filter: { userId: uid, punchInAt },
          update: {
            $set: {
              punchInNote: note,
              punchOutAt: punchOutAt ?? null,
            },
            $setOnInsert: {
              userId: uid,
              punchInAt,
              punchOutNote: "",
            },
          },
          upsert: true,
        },
      });

      accepted++;
    }

    if (!ops.length) {
      return res.status(400).json({ message: "No valid rows found in file" });
    }

    const result = await AttendanceSession.bulkWrite(ops, { ordered: false });

    return res.json({
      message: "Import successful",
      accepted,
      rejected,
      upserted: result.upsertedCount || 0,
      modified: result.modifiedCount || 0,
    });
  } catch (e: any) {
    // If the unique index is present, duplicate key errors can show if old duplicates exist.
    return res.status(400).json({ message: e?.message || "CSV import failed" });
  }
}

// ✅ ONE-TIME CLEANUP: remove duplicate records having same userId + punchInAt
// DELETE /api/time/attendance/me/cleanup-duplicates
export async function cleanupMyDuplicates(req: Request, res: Response) {
  const userId = getUserId(req as any);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const uid = new mongoose.Types.ObjectId(userId);

  // group by same punchInAt
  const groups = await AttendanceSession.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: { userId: "$userId", punchInAt: "$punchInAt" },
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  let deleted = 0;

  for (const g of groups) {
    const ids: mongoose.Types.ObjectId[] = g.ids || [];
    // keep first, delete rest
    const toDelete = ids.slice(1);
    if (toDelete.length) {
      const r = await AttendanceSession.deleteMany({ _id: { $in: toDelete } });
      deleted += r.deletedCount || 0;
    }
  }

  return res.json({
    message: "Duplicates cleaned",
    groups: groups.length,
    deleted,
  });
}


