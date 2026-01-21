// backend/src/modules/leave/leave.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";

import { LeaveType, LeaveRequest, LeaveStatus } from "./leave.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { notifyRoles, notifyUsers } from "../notifications/notify.utils";

import { Employee } from "../employees/employee.model";
import { Supervisor } from "../my-info/reportTo/reportTo.model";
import { User } from "../auth/auth.model";
import { Counter } from "../pim/pimConfig/models/counter.model";

/* ============================= ObjectId helpers ============================= */

function toObjectId(id: unknown): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
  throw ApiError.badRequest("Invalid ObjectId");
}

function toObjectIdOrNull(id: unknown): mongoose.Types.ObjectId | null {
  try {
    return id ? toObjectId(id) : null;
  } catch {
    return null;
  }
}

/* ============================= Mapping helpers ============================= */

function mapLeave(doc: any) {
  const plain = doc?.toObject ? doc.toObject() : doc;

  return {
    ...plain,
    _id: String(plain._id),
    fromDate: plain.startDate,
    toDate: plain.endDate,
    pendingWith: plain.status === "PENDING" ? "SUPERVISOR" : null,
  };
}

function calcDaysInclusive(start: Date, end: Date) {
  const a = new Date(start);
  const b = new Date(end);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diffMs = b.getTime() - a.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/* ============================= Employee mapping (User -> Employee) ============================= */

async function nextEmployeeId(prefix = "", pad = 4) {
  const c = await Counter.findOneAndUpdate(
    { key: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(c.seq).padStart(pad, "0")}`;
}

/**
 * Ensures Employee exists for logged-in User id.
 */
async function ensureEmployeeForUser(userId: string) {
  const u = await User.findById(userId).select("email username firstName lastName").lean();
  if (!u) throw ApiError.notFound("User not found");

  const email = (u.email || "").trim();
  const username = (u.username || "").trim();

  let employee =
    (email && (await Employee.findOne({ email }).exec())) ||
    (username && (await Employee.findOne({ email: username }).exec()));

  if (employee) return employee;

  const base =
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    username ||
    (email ? email.split("@")[0] : "New Employee");

  const parts = base.replace(/[._-]+/g, " ").trim().split(/\s+/);
  const firstName = parts[0] || "New";
  const lastName = parts.slice(1).join(" ") || "Employee";
  const employeeId = await nextEmployeeId("", 4);

  employee = await Employee.create({
    employeeId,
    firstName,
    lastName,
    email: email || username || undefined,
    status: "ACTIVE",
  });

  return employee;
}

async function findDirectSupervisorEmployeeId(employeeId: unknown) {
  const empId = toObjectId(employeeId);
  const rel = await Supervisor.findOne({ employeeId: empId }).sort({ createdAt: 1 }).lean();
  return toObjectIdOrNull((rel as any)?.supervisorId);
}

async function findUserIdByEmployeeEmail(email?: string | null) {
  const e = (email || "").trim();
  if (!e) return null;

  const u = await User.findOne({ $or: [{ email: e }, { username: e }] })
    .collation({ locale: "en", strength: 2 })
    .select("_id")
    .lean();

  return u?._id ? String(u._id) : null;
}

/* ============================= LEAVE TYPES ============================= */

export async function listLeaveTypes(_req: Request, res: Response) {
  const types = await LeaveType.find({ isActive: true }).lean();
  res.json(types);
}

export async function createLeaveType(req: AuthRequest, res: Response) {
  const { name, code } = req.body || {};

  if (!name || !String(name).trim()) throw ApiError.badRequest("name is required");

  const finalCode =
    (code && String(code).trim()) || String(name).trim().toUpperCase().replace(/\s+/g, "_");

  const existing = await LeaveType.findOne({ code: finalCode }).exec();
  if (existing) throw new ApiError(409, "Leave type with this code already exists");

  const type = await LeaveType.create({ name: String(name).trim(), code: finalCode });
  res.status(201).json(type);
}

export async function deleteLeaveType(req: AuthRequest, res: Response) {
  const { id } = req.params;

  const type = await LeaveType.findById(id).exec();
  if (!type) throw ApiError.notFound("Leave type not found");

  type.isActive = false;
  await type.save();

  res.json({ ok: true });
}

/* ============================= LEAVE REQUESTS ============================= */

/**
 * Employee applies leave -> goes ONLY to Supervisor approval.
 * HR/Admin are NOT approvers.
 */
export async function createLeaveRequest(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { typeId, fromDate, toDate, reason, startDate, endDate } = req.body || {};
  const effectiveFrom = fromDate || startDate;
  const effectiveTo = toDate || endDate;

  if (!typeId || !effectiveFrom || !effectiveTo) {
    throw ApiError.badRequest("typeId, fromDate and toDate are required");
  }

  const start = new Date(effectiveFrom);
  const end = new Date(effectiveTo);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw ApiError.badRequest("Invalid date format");
  if (end < start) throw ApiError.badRequest("toDate cannot be before fromDate");

  const days = calcDaysInclusive(start, end);

  const employee = await ensureEmployeeForUser(req.user.id);
  const supervisorEmployeeId = await findDirectSupervisorEmployeeId(employee._id);

  if (!supervisorEmployeeId) {
    throw ApiError.badRequest(
      "No supervisor is assigned for you. Please set your Report-To supervisor before applying leave."
    );
  }

  // Ensure supervisor has a user account
  const supEmployee = await Employee.findById(supervisorEmployeeId).select("email").lean();
  const supUserId = await findUserIdByEmployeeEmail(supEmployee?.email);

  if (!supUserId) {
    throw ApiError.badRequest(
      "Your supervisor does not have a user account linked (email mismatch). Ask admin to fix supervisor login/email mapping."
    );
  }

  const now = new Date();

  const request = await LeaveRequest.create({
    employee: toObjectId(employee._id),
    type: toObjectId(typeId),
    startDate: start,
    endDate: end,
    reason,
    days,
    status: "PENDING",
    approval: {
      supervisorEmployee: supervisorEmployeeId,
      supervisorAction: "PENDING",
    },
    history: [
      {
        action: "CREATED",
        byUser: toObjectId(req.user.id),
        byRole: req.user.role,
        at: now,
        remarks: reason,
      },
    ],
  });

  // 🔔 Notify Supervisor only
  await notifyUsers({
    userIds: [supUserId],
    title: "Leave Request Needs Your Approval",
    message: `${employee.firstName || "Employee"} ${employee.lastName || ""} applied for leave (${days} day(s)).`,
    type: "LEAVE",
    link: "/leave",
    meta: { leaveId: request._id },
  });

  res.status(201).json(mapLeave(request));
}

export async function listMyLeave(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { fromDate, toDate, status, typeId } = req.query as any;

  const employee = await ensureEmployeeForUser(req.user.id);
  const employeeId = toObjectId(employee._id);

  const query: any = { employee: employeeId };
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

/**
 * HR/Admin: see all
 * Supervisor: see only leaves assigned to them
 */
export async function listAllLeave(req: AuthRequest, res: Response) {
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

  if (req.user?.role === "SUPERVISOR") {
    const actingEmployee = await ensureEmployeeForUser(req.user.id);
    query["approval.supervisorEmployee"] = toObjectId(actingEmployee._id);
  }

  const items = await LeaveRequest.find(query).populate("employee").populate("type").lean();
  res.json(items.map(mapLeave));
}

/**
 * PATCH /leave/:id/status
 * - Employee can CANCEL their own pending request
 * - Supervisor can APPROVE/REJECT only for requests assigned to them
 * - HR/Admin cannot approve/reject (only notified after approval)
 */
export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, remarks } = (req.body || {}) as { status?: LeaveStatus; remarks?: string };

  if (!status || !["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const leave = await LeaveRequest.findById(id).populate("employee").populate("type").exec();
  if (!leave) throw ApiError.notFound("Leave request not found");

  const now = new Date();
  const employeeDoc: any = leave.employee as any;
  const employeeUserId = await findUserIdByEmployeeEmail(employeeDoc?.email);

  // Employee cancel
  if (status === "CANCELLED") {
    if (leave.status !== "PENDING") throw ApiError.badRequest("Only pending leave requests can be cancelled");

    const actingEmployee = await ensureEmployeeForUser(req.user.id);
    if (String(employeeDoc?._id || leave.employee) !== String(actingEmployee._id)) {
      throw ApiError.forbidden("You can only cancel your own leave request");
    }

    leave.status = "CANCELLED";
    leave.history.push({
      action: "CANCELLED",
      byUser: toObjectId(req.user.id),
      byRole: req.user.role,
      at: now,
      remarks,
    });

    await leave.save();
    res.json(mapLeave(leave));
    return;
  }

  // Approve/reject: supervisor only
  if (leave.status !== "PENDING") throw ApiError.badRequest("Only pending leave requests can be approved/rejected");
  if (req.user.role !== "SUPERVISOR") throw ApiError.forbidden("Only the assigned supervisor can approve/reject leave");

  const actingEmployee = await ensureEmployeeForUser(req.user.id);
  const assignedSupervisorEmployeeId = (leave.approval as any)?.supervisorEmployee;

  if (!assignedSupervisorEmployeeId) {
    throw ApiError.badRequest("This leave request has no supervisor assigned (legacy data)");
  }

  if (String(assignedSupervisorEmployeeId) !== String(toObjectId(actingEmployee._id))) {
    throw ApiError.forbidden("Only the assigned supervisor can act on this request");
  }

  // ✅ Ensure approval exists (TS-safe)
  const approval = (leave.approval ??= {} as any);

  leave.status = status as any;
  approval.supervisorAction = status === "APPROVED" ? "APPROVED" : "REJECTED";
  approval.supervisorActedBy = toObjectId(req.user.id);
  approval.supervisorActedAt = now;
  approval.supervisorRemarks = remarks;

  leave.history.push({
    action: status === "APPROVED" ? "APPROVED" : "REJECTED",
    byUser: toObjectId(req.user.id),
    byRole: req.user.role,
    at: now,
    remarks,
  });

  await leave.save();

  // Notify employee
  if (employeeUserId) {
    await notifyUsers({
      userIds: [employeeUserId],
      title: status === "APPROVED" ? "Leave Approved" : "Leave Rejected",
      message:
        status === "APPROVED"
          ? "Your leave request was approved by your supervisor."
          : "Your leave request was rejected by your supervisor.",
      type: "LEAVE",
      link: "/leave/my-leave",
      meta: { leaveId: leave._id },
    });
  }

  // ✅ HR/Admin notification AFTER approval only
  if (status === "APPROVED") {
    const startStr = new Date(leave.startDate).toISOString().slice(0, 10);
    const endStr = new Date(leave.endDate).toISOString().slice(0, 10);

    await notifyRoles({
      roles: ["HR", "ADMIN"],
      title: "Employee On Leave (Approved)",
      message: `${employeeDoc?.firstName || "Employee"} ${employeeDoc?.lastName || ""} is on leave (${startStr} to ${endStr}).`,
      type: "LEAVE",
      link: "/leave",
      meta: { leaveId: leave._id },
    });
  }

  res.json(mapLeave(leave));
}

/**
 * HR/Admin assigns leave directly to an employee (no supervisor approval).
 */
export async function assignLeave(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");
  if (req.user.role !== "ADMIN" && req.user.role !== "HR") throw ApiError.forbidden("Only HR/Admin can assign leave");

  const { employeeId, typeId, fromDate, toDate, reason, startDate, endDate } = req.body || {};
  const effectiveFrom = fromDate || startDate;
  const effectiveTo = toDate || endDate;

  if (!employeeId || !typeId || !effectiveFrom || !effectiveTo) {
    throw ApiError.badRequest("employeeId, typeId, fromDate and toDate are required");
  }

  const employee = await Employee.findById(employeeId).exec();
  if (!employee) throw ApiError.notFound("Employee not found");

  const start = new Date(effectiveFrom);
  const end = new Date(effectiveTo);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw ApiError.badRequest("Invalid date format");
  if (end < start) throw ApiError.badRequest("toDate cannot be before fromDate");

  const days = calcDaysInclusive(start, end);
  const now = new Date();

  const leave = await LeaveRequest.create({
    employee: toObjectId(employee._id),
    type: toObjectId(typeId),
    startDate: start,
    endDate: end,
    reason,
    days,
    status: "APPROVED",
    approval: {
      supervisorAction: "APPROVED",
      supervisorActedBy: toObjectId(req.user.id),
      supervisorActedAt: now,
      supervisorRemarks: "Assigned by HR/Admin",
    },
    history: [
      {
        action: "ASSIGNED",
        byUser: toObjectId(req.user.id),
        byRole: req.user.role,
        at: now,
        remarks: reason,
      },
    ],
  });

  const employeeUserId = await findUserIdByEmployeeEmail((employee as any)?.email);
  if (employeeUserId) {
    await notifyUsers({
      userIds: [employeeUserId],
      title: "Leave Assigned",
      message: `A leave (${days} day(s)) was assigned to you by ${req.user.role}.`,
      type: "LEAVE",
      link: "/leave/my-leave",
      meta: { leaveId: leave._id },
    });
  }

  res.status(201).json(mapLeave(leave));
}
