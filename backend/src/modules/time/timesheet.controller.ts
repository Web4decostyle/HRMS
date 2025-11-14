// backend/src/modules/time/timesheet.controller.ts
import { Request, Response } from "express";
import { Timesheet } from "./timesheet.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";

// Helper: ensure we always have start <= end
function normalizePeriod(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) {
    throw ApiError.badRequest("Invalid periodStart or periodEnd");
  }
  if (s > e) {
    throw ApiError.badRequest("periodStart must be <= periodEnd");
  }
  return { periodStart: s, periodEnd: e };
}

// POST /api/time/timesheets
// Employee creates a timesheet (or updates entries)
export async function createTimesheet(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const { periodStart, periodEnd, entries } = req.body;

  const { periodStart: s, periodEnd: e } = normalizePeriod(
    periodStart,
    periodEnd
  );

  const timesheet = await Timesheet.create({
    employee: req.user.id,
    periodStart: s,
    periodEnd: e,
    status: "OPEN",
    entries: entries || [],
  });

  res.status(201).json(timesheet);
}

// GET /api/time/timesheets/my
export async function listMyTimesheets(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const items = await Timesheet.find({ employee: req.user.id })
    .sort({ periodStart: -1 })
    .lean();

  res.json(items);
}

// GET /api/time/timesheets/:id
export async function getTimesheetById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const ts = await Timesheet.findById(id)
    .populate("employee")
    .lean();

  if (!ts) {
    throw ApiError.notFound("Timesheet not found");
  }

  // Optional: enforce that only owner or managers can view.
  // For now we just return it.
  res.json(ts);
}

// GET /api/time/timesheets
// For ADMIN / HR / SUPERVISOR
export async function listAllTimesheets(_req: Request, res: Response) {
  const items = await Timesheet.find()
    .populate("employee")
    .sort({ periodStart: -1 })
    .lean();

  res.json(items);
}

// PATCH /api/time/timesheets/:id/status
// For ADMIN / HR / SUPERVISOR
export async function updateTimesheetStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!["OPEN", "SUBMITTED", "APPROVED", "REJECTED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const ts = await Timesheet.findById(id).exec();
  if (!ts) {
    throw ApiError.notFound("Timesheet not found");
  }

  ts.status = status;
  await ts.save();

  res.json(ts);
}
