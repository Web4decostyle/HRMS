// backend/src/modules/attendance/attendance.controller.ts
import { Response } from "express";
import { Attendance } from "./attendance.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";

// POST /api/time/attendance/clock-in
export async function clockIn(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const now = new Date();
  const date = new Date(now.toDateString()); // normalize to midnight

  // prevent multiple open records for same day
  const existingOpen = await Attendance.findOne({
    employee: req.user.id,
    status: "OPEN",
  }).exec();

  if (existingOpen) {
    throw ApiError.badRequest("You already have an open attendance record");
  }

  const record = await Attendance.create({
    employee: req.user.id,
    date,
    inTime: now,
    status: "OPEN",
  });

  res.status(201).json(record);
}

// POST /api/time/attendance/clock-out
export async function clockOut(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const record = await Attendance.findOne({
    employee: req.user.id,
    status: "OPEN",
  }).exec();

  if (!record) {
    throw ApiError.badRequest("No open attendance record to close");
  }

  record.outTime = new Date();
  record.status = "CLOSED";
  await record.save();

  res.json(record);
}

// GET /api/time/attendance/my
export async function listMyAttendance(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { from, to } = req.query;

  const filter: any = { employee: req.user.id };
  if (from) filter.date = { ...filter.date, $gte: new Date(from as string) };
  if (to) filter.date = { ...filter.date, $lte: new Date(to as string) };

  const items = await Attendance.find(filter)
    .sort({ date: -1 })
    .lean();

  res.json(items);
}

// GET /api/time/attendance
export async function listAllAttendance(_req: AuthRequest, res: Response) {
  const items = await Attendance.find()
    .populate("employee")
    .sort({ date: -1 })
    .lean();

  res.json(items);
}
