// backend/src/modules/time/timesheet.controller.ts
import { Request, Response } from "express";
import { Timesheet } from "./timesheet.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";
import { notifyRoles, notifyUsers } from "../notifications/notify.utils";

// Helper
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

// Employee creates timesheet
export async function createTimesheet(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const { periodStart, periodEnd, entries } = req.body;
  const { periodStart: s, periodEnd: e } = normalizePeriod(periodStart, periodEnd);

  const timesheet = await Timesheet.create({
    employee: req.user.id,
    periodStart: s,
    periodEnd: e,
    status: "OPEN",
    entries: entries || [],
  });

  // 🔔 Notify employee (optional but useful)
  await notifyUsers({
    userIds: [req.user.id],
    title: "Timesheet Created",
    message: "Your timesheet has been created.",
    type: "TIME",
    link: "/time/timesheets/my",
    meta: { timesheetId: timesheet._id },
  });

  res.status(201).json(timesheet);
}

// Employee list
export async function listMyTimesheets(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const items = await Timesheet.find({ employee: req.user.id })
    .sort({ periodStart: -1 })
    .lean();

  res.json(items);
}

// Get single timesheet
export async function getTimesheetById(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const ts = await Timesheet.findById(id).populate("employee").lean();
  if (!ts) {
    throw ApiError.notFound("Timesheet not found");
  }

  res.json(ts);
}

// HR / Admin list
export async function listAllTimesheets(_req: Request, res: Response) {
  const items = await Timesheet.find()
    .populate("employee")
    .sort({ periodStart: -1 })
    .lean();

  res.json(items);
}

// Status update (submit / approve / reject)
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

  if (status === "SUBMITTED") {
    await notifyRoles({
      roles: ["ADMIN", "HR", "SUPERVISOR"],
      title: "Timesheet Submitted",
      message: "A timesheet has been submitted for approval.",
      type: "TIME",
      link: "/time/timesheets",
      meta: { timesheetId: ts._id },
    });
  }

  if (status === "APPROVED" || status === "REJECTED") {
    await notifyUsers({
      userIds: [ts.employee as any],
      title: `Timesheet ${status === "APPROVED" ? "Approved" : "Rejected"}`,
      message: `Your timesheet was ${status.toLowerCase()}.`,
      type: "TIME",
      link: "/time/timesheets/my",
      meta: { timesheetId: ts._id },
    });
  }

  res.json(ts);
}
