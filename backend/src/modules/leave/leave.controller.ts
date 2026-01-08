// backend/src/modules/leave/leave.controller.ts
import { Request, Response } from "express";
import { LeaveType, LeaveRequest } from "./leave.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { notifyRoles, notifyUsers } from "../notifications/notify.utils";

// helper: map DB document → API shape
function mapLeave(doc: any) {
  return {
    ...doc,
    fromDate: doc.startDate,
    toDate: doc.endDate,
  };
}

/* ============================= LEAVE TYPES ============================= */

export async function listLeaveTypes(_req: Request, res: Response) {
  const types = await LeaveType.find({ isActive: true }).lean();
  res.json(types);
}

export async function createLeaveType(req: Request, res: Response) {
  const { name, code } = req.body;

  if (!name || !name.trim()) {
    throw ApiError.badRequest("name is required");
  }

  const finalCode =
    (code && String(code).trim()) ||
    name.trim().toUpperCase().replace(/\s+/g, "_");

  const existing = await LeaveType.findOne({ code: finalCode }).exec();
  if (existing) {
    throw new ApiError(409, "Leave type with this code already exists");
  }

  const type = await LeaveType.create({
    name: name.trim(),
    code: finalCode,
  });

  res.status(201).json(type);
}

/* ============================= LEAVE REQUESTS ============================= */

// Employee applies leave
export async function createLeaveRequest(req: AuthRequest, res: Response) {
  const { typeId, fromDate, toDate, reason, startDate, endDate } = req.body;

  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const effectiveFrom = fromDate || startDate;
  const effectiveTo = toDate || endDate;

  if (!typeId || !effectiveFrom || !effectiveTo) {
    throw ApiError.badRequest("typeId, fromDate and toDate are required");
  }

  const start = new Date(effectiveFrom);
  const end = new Date(effectiveTo);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw ApiError.badRequest("Invalid date format");
  }

  const diffMs = end.getTime() - start.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  const request = await LeaveRequest.create({
    employee: req.user.id,
    type: typeId,
    startDate: start,
    endDate: end,
    reason,
    days,
  });

  // 🔔 Notify HR / Admin / Supervisor
  await notifyRoles({
    roles: ["ADMIN", "HR", "SUPERVISOR"],
    title: "New Leave Request",
    message: `${req.user.username || "Employee"} applied for leave (${days} day(s))`,
    type: "LEAVE",
    link: "/leave/list",
    meta: { leaveId: request._id },
  });

  res.status(201).json(mapLeave(request.toObject()));
}

// Employee's own leave list
export async function listMyLeave(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const { fromDate, toDate, status, typeId } = req.query as any;

  const query: any = { employee: req.user.id };
  if (status) query.status = status;
  if (typeId) query.type = typeId;

  if (fromDate || toDate) {
    query.startDate = {};
    if (fromDate) query.startDate.$gte = new Date(fromDate);
    if (toDate) query.startDate.$lte = new Date(toDate);
  }

  const items = await LeaveRequest.find(query).populate("type").lean();
  res.json(items.map(mapLeave));
}

// HR / Admin list
export async function listAllLeave(req: Request, res: Response) {
  const { fromDate, toDate, status, typeId, employeeId } = req.query as any;

  const query: any = {};
  if (status) query.status = status;
  if (typeId) query.type = typeId;
  if (employeeId) query.employee = employeeId;

  if (fromDate || toDate) {
    query.startDate = {};
    if (fromDate) query.startDate.$gte = new Date(fromDate);
    if (toDate) query.startDate.$lte = new Date(toDate);
  }

  const items = await LeaveRequest.find(query)
    .populate("employee")
    .populate("type")
    .lean();

  res.json(items.map(mapLeave));
}

// Approve / Reject / Cancel
export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const leave = await LeaveRequest.findById(id)
    .populate("employee")
    .populate("type")
    .exec();

  if (!leave) {
    throw ApiError.notFound("Leave request not found");
  }

  leave.status = status;
  await leave.save();

  const employeeUserId =
    typeof leave.employee === "object"
      ? (leave.employee as any)._id
      : leave.employee;

  if (status === "APPROVED" || status === "REJECTED") {
    await notifyUsers({
      userIds: [employeeUserId],
      title: `Leave ${status === "APPROVED" ? "Approved" : "Rejected"}`,
      message: `Your leave request has been ${status.toLowerCase()}.`,
      type: "LEAVE",
      link: "/leave/my",
      meta: { leaveId: leave._id },
    });
  }

  if (status === "CANCELLED") {
    await notifyRoles({
      roles: ["ADMIN", "HR", "SUPERVISOR"],
      title: "Leave Cancelled",
      message: `A leave request was cancelled.`,
      type: "LEAVE",
      link: "/leave/list",
      meta: { leaveId: leave._id },
    });
  }

  res.json(mapLeave(leave.toObject()));
}
