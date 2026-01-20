import { Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { Holiday, WorkWeekConfig } from "./leave.config.model";

export async function getWorkWeekConfig(_req: AuthRequest, res: Response) {
  let doc = await WorkWeekConfig.findOne().exec();
  if (!doc) {
    doc = await WorkWeekConfig.create({});
  }
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
  const allowed = ["FULL", "HALF", "NONE"] as const;

  const payload = {
    monday: req.body.monday,
    tuesday: req.body.tuesday,
    wednesday: req.body.wednesday,
    thursday: req.body.thursday,
    friday: req.body.friday,
    saturday: req.body.saturday,
    sunday: req.body.sunday,
  };

  for (const [k, v] of Object.entries(payload)) {
    if (!allowed.includes(String(v) as any)) {
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

export async function listHolidays(_req: AuthRequest, res: Response) {
  const docs = await Holiday.find({}).sort({ date: 1 }).lean();
  res.json(
    docs.map((h) => ({
      _id: String(h._id),
      name: h.name,
      date: new Date(h.date).toISOString(),
      isHalfDay: Boolean(h.isHalfDay),
    }))
  );
}

export async function createHoliday(req: AuthRequest, res: Response) {
  const { name, date, isHalfDay } = req.body || {};
  if (!name || !date) {
    throw ApiError.badRequest("name and date are required");
  }

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw ApiError.badRequest("Invalid date");
  }

  const doc = await Holiday.create({
    name,
    date: d,
    isHalfDay: Boolean(isHalfDay),
  });

  res.status(201).json({
    _id: String(doc._id),
    name: doc.name,
    date: doc.date.toISOString(),
    isHalfDay: Boolean(doc.isHalfDay),
  });
}

export async function deleteHoliday(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const doc = await Holiday.findByIdAndDelete(id).exec();
  if (!doc) throw ApiError.notFound("Holiday not found");
  res.json({ ok: true });
}
