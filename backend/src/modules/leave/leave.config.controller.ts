// backend/src/modules/leave/leave.config.controller.ts
import { Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { Holiday, WorkWeekConfig, WorkDayConfig } from "./leave.config.model";

const ALLOWED_WORKDAY_VALUES: WorkDayConfig[] = ["FULL", "HALF", "NONE"];

export async function getWorkWeekConfig(_req: AuthRequest, res: Response) {
  let doc = await WorkWeekConfig.findOne().exec();
  if (!doc) doc = await WorkWeekConfig.create({});

  res.json({
    monday: doc.monday,
    tuesday: doc.tuesday,
    wednesday: doc.wednesday,
    thursday: doc.thursday,
    friday: doc.friday,
    saturday: doc.saturday,
    sunday: doc.sunday,
  });
}

export async function saveWorkWeekConfig(req: AuthRequest, res: Response) {
  const payload = {
    monday: req.body?.monday,
    tuesday: req.body?.tuesday,
    wednesday: req.body?.wednesday,
    thursday: req.body?.thursday,
    friday: req.body?.friday,
    saturday: req.body?.saturday,
    sunday: req.body?.sunday,
  };

  for (const [k, v] of Object.entries(payload)) {
    if (!ALLOWED_WORKDAY_VALUES.includes(String(v) as WorkDayConfig)) {
      throw ApiError.badRequest(`Invalid value for ${k}`);
    }
  }

  const doc = await WorkWeekConfig.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
  }).exec();

  res.json({
    monday: doc.monday,
    tuesday: doc.tuesday,
    wednesday: doc.wednesday,
    thursday: doc.thursday,
    friday: doc.friday,
    saturday: doc.saturday,
    sunday: doc.sunday,
  });
}

export async function listHolidays(req: AuthRequest, res: Response) {
  const { from, to } = (req.query || {}) as any;

  const q: any = {};
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }

  const docs = await Holiday.find(q).sort({ date: 1 }).lean();

  res.json(
    docs.map((h) => ({
      _id: String(h._id),
      name: h.name,
      date: new Date(h.date).toISOString(),
      isHalfDay: Boolean(h.isHalfDay),
      repeatsAnnually: Boolean((h as any).repeatsAnnually),
    }))
  );
}

export async function createHoliday(req: AuthRequest, res: Response) {
  const { name, date, isHalfDay, repeatsAnnually } = req.body || {};
  if (!name || !date) throw ApiError.badRequest("name and date are required");

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) throw ApiError.badRequest("Invalid date");

  const doc = await Holiday.create({
    name,
    date: d,
    isHalfDay: Boolean(isHalfDay),
    repeatsAnnually: Boolean(repeatsAnnually),
  });

  res.status(201).json({
    _id: String(doc._id),
    name: doc.name,
    date: doc.date.toISOString(),
    isHalfDay: Boolean(doc.isHalfDay),
    repeatsAnnually: Boolean((doc as any).repeatsAnnually),
  });
}

export async function deleteHoliday(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const doc = await Holiday.findByIdAndDelete(id).exec();
  if (!doc) throw ApiError.notFound("Holiday not found");
  res.json({ ok: true });
}
