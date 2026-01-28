// backend/src/modules/leave/leave.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";

import { LeaveType, LeaveRequest, LeaveStatus } from "./leave.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { notifyRoles, notifyUsers } from "../notifications/notify.utils";
import { createAuditLog } from "../audit/audit.service";

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

/**
 * Supervisor mapping can be stored as { employeeId: ObjectId } or { employee: ObjectId }
 * depending on schema versions. We support both.
 */
async function findDirectSupervisorEmployeeId(employeeId: unknown) {
  const empId = toObjectId(employeeId);

  const rel = await Supervisor.findOne({
    $or: [{ employeeId: empId }, { employee: empId }],
  })
    .sort({ createdAt: 1 })
    .lean();

  return toObjectIdOrNull((rel as any)?.supervisorId || (rel as any)?.supervisor);
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
 * Employee applies leave -> can be approved by the assigned Supervisor OR Admin/HR.
 * If ONE of them approves/rejects, the request is completed (no second approval required).
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
  const employeeId = toObjectId(employee._id);
  const leaveTypeObjId = toObjectId(typeId);

  // Balance enforcement is disabled in this project.

  const supervisorEmployeeId = await findDirectSupervisorEmployeeId(employee._id);

  // Supervisor user is optional. If missing/mismatched, Admin/HR can still approve.
  let supUserId: string | null = null;
  if (supervisorEmployeeId) {
    const supEmployee = await Employee.findById(supervisorEmployeeId).select("email").lean();
    supUserId = await findUserIdByEmployeeEmail(supEmployee?.email);
  }

  const now = new Date();

  const request = await LeaveRequest.create({
    employee: employeeId,
    type: leaveTypeObjId,
    startDate: start,
    endDate: end,
    reason,
    days,
    status: "PENDING",
    approval: {
      supervisorEmployee: supervisorEmployeeId || undefined,
      supervisorAction: "PENDING",
      adminAction: "PENDING",
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

  // ✅ Admin History (Audit)
  await createAuditLog({
    req,
    action: "LEAVE_REQUEST_CREATED",
    module: "Leave",
    modelName: "LeaveRequest",
    actionType: "CREATE",
    targetId: String(request._id),
    after: {
      status: request.status,
      employeeId: String(employee._id),
      fromDate: start,
      toDate: end,
      days,
      typeId: String(typeId),
      reason: (reason || "").toString(),
    },
    meta: {
      requestedBy: req.user.id,
      leaveId: String(request._id),
    },
  });

  // 🔔 Notify Supervisor (if mapped)
  if (supUserId) {
    await notifyUsers({
      userIds: [supUserId],
      title: "Leave Request Needs Approval",
      message: `${employee.firstName || "Employee"} ${employee.lastName || ""} applied for leave (${days} day(s)).`,
      type: "LEAVE",
      link: "/leave",
      meta: { leaveId: request._id },
    });
  }

  // 🔔 Notify Admin + HR (both)
  await notifyRoles({
    roles: ["ADMIN", "HR"],
    title: "Leave Request Submitted",
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

export async function getLeaveById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const leave = await LeaveRequest.findById(id)
    .populate("employee")
    .populate("type")
    .lean();

  if (!leave) throw ApiError.notFound("Leave request not found");

  // ✅ Access rules:
  // - ADMIN/HR can view any
  // - SUPERVISOR can view only if assigned supervisor
  // - ESS/ESS_VIEWER can view only if it's their own
  const role = req.user.role;

  if (role === "ADMIN" || role === "HR") {
    return res.json(leave);
  }

  if (role === "SUPERVISOR") {
    const actingEmployee = await ensureEmployeeForUser(req.user.id);
    const assignedSupervisorEmployeeId = (leave as any)?.approval?.supervisorEmployee;

    if (!assignedSupervisorEmployeeId) {
      throw ApiError.forbidden("You are not assigned to this leave request");
    }

    if (String(assignedSupervisorEmployeeId) !== String(actingEmployee._id)) {
      throw ApiError.forbidden("You are not assigned to this leave request");
    }

    return res.json(leave);
  }

  // ESS / ESS_VIEWER => own only
  const actingEmployee = await ensureEmployeeForUser(req.user.id);
  if (String((leave as any).employee?._id || (leave as any).employee) !== String(actingEmployee._id)) {
    throw ApiError.forbidden("You can only view your own leave request");
  }

  return res.json(leave);
}

/**
 * PATCH /leave/:id/status
 * - Employee can CANCEL their own pending request
 * - Supervisor can APPROVE/REJECT only for requests assigned to them
 * - Admin/HR can APPROVE/REJECT any pending request
 * - Only ONE approval is required (Supervisor OR Admin/HR)
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

  const prevStatus = leave.status;

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

    await createAuditLog({
      req,
      action: "LEAVE_REQUEST_CANCELLED",
      module: "Leave",
      modelName: "LeaveRequest",
      actionType: "UPDATE",
      targetId: String(leave._id),
      before: { status: prevStatus },
      after: { status: "CANCELLED" },
      decisionReason: (remarks || "").toString(),
      meta: { leaveId: String(leave._id), requestedBy: req.user.id },
    });

    res.json(mapLeave(leave));
    return;
  }

  // Approve/reject: Supervisor OR Admin/HR
  if (leave.status !== "PENDING") throw ApiError.badRequest("Only pending leave requests can be approved/rejected");
  if (!["SUPERVISOR", "ADMIN", "HR"].includes(req.user.role)) {
    throw ApiError.forbidden("Only the assigned supervisor, HR, or an admin can approve/reject leave");
  }

  const approval = (leave.approval ??= {} as any);
  const isSupervisorActing = req.user.role === "SUPERVISOR";

  if (isSupervisorActing) {
    const actingEmployee = await ensureEmployeeForUser(req.user.id);
    const assignedSupervisorEmployeeId = (leave.approval as any)?.supervisorEmployee;

    if (!assignedSupervisorEmployeeId) {
      throw ApiError.badRequest("This leave request has no supervisor assigned (admin/HR can still approve)");
    }

    if (String(assignedSupervisorEmployeeId) !== String(toObjectId(actingEmployee._id))) {
      throw ApiError.forbidden("Only the assigned supervisor can act on this request");
    }
  }

  leave.status = status as any;

  if (isSupervisorActing) {
    approval.supervisorAction = status === "APPROVED" ? "APPROVED" : "REJECTED";
    approval.supervisorActedBy = toObjectId(req.user.id);
    approval.supervisorActedAt = now;
    approval.supervisorRemarks = remarks;
  } else {
    approval.adminAction = status === "APPROVED" ? "APPROVED" : "REJECTED";
    approval.adminActedBy = toObjectId(req.user.id);
    approval.adminActedAt = now;
    approval.adminRemarks = remarks;
  }

  leave.history.push({
    action: status === "APPROVED" ? "APPROVED" : "REJECTED",
    byUser: toObjectId(req.user.id),
    byRole: req.user.role,
    at: now,
    remarks,
  });

  await leave.save();

  await createAuditLog({
    req,
    action: status === "APPROVED" ? "LEAVE_REQUEST_APPROVED" : "LEAVE_REQUEST_REJECTED",
    module: "Leave",
    modelName: "LeaveRequest",
    actionType: "UPDATE",
    targetId: String(leave._id),
    before: { status: prevStatus },
    after: {
      status,
      decidedByRole: req.user.role,
      decidedByUserId: req.user.id,
      remarks: (remarks || "").toString(),
    },
    approvedAt: now,
    approvedBy: req.user.id,
    decisionReason: (remarks || "").toString(),
    meta: { leaveId: String(leave._id), employeeId: String(employeeDoc?._id || "") },
  });

  // Notify employee
  if (employeeUserId) {
    await notifyUsers({
      userIds: [employeeUserId],
      title: status === "APPROVED" ? "Leave Approved" : "Leave Rejected",
      message:
        status === "APPROVED"
          ? `Your leave request was approved by ${isSupervisorActing ? "your supervisor" : "HR/Admin"}.`
          : `Your leave request was rejected by ${isSupervisorActing ? "your supervisor" : "HR/Admin"}.`,
      type: "LEAVE",
      link: "/leave/my-leave",
      meta: { leaveId: leave._id },
    });
  }

  // Notify the "other" approver group
  const startStr = new Date(leave.startDate).toISOString().slice(0, 10);
  const endStr = new Date(leave.endDate).toISOString().slice(0, 10);

  if (isSupervisorActing) {
    await notifyRoles({
      roles: ["ADMIN", "HR"],
      title: status === "APPROVED" ? "Leave Approved" : "Leave Rejected",
      message: `${employeeDoc?.firstName || "Employee"} ${employeeDoc?.lastName || ""} leave (${startStr} to ${endStr}) was ${status.toLowerCase()} by the supervisor.`,
      type: "LEAVE",
      link: "/leave",
      meta: { leaveId: leave._id },
    });
  } else {
    const assignedSupervisorEmployeeId = (leave.approval as any)?.supervisorEmployee;
    if (assignedSupervisorEmployeeId) {
      const supEmployee = await Employee.findById(assignedSupervisorEmployeeId).select("email").lean();
      const supUserId = await findUserIdByEmployeeEmail(supEmployee?.email);
      if (supUserId) {
        await notifyUsers({
          userIds: [supUserId],
          title: status === "APPROVED" ? "Leave Approved" : "Leave Rejected",
          message: `${employeeDoc?.firstName || "Employee"} ${employeeDoc?.lastName || ""} leave (${startStr} to ${endStr}) was ${status.toLowerCase()} by HR/Admin.`,
          type: "LEAVE",
          link: "/leave",
          meta: { leaveId: leave._id },
        });
      }
    }
  }

  res.json(mapLeave(leave));
}

/**
 * HR/Admin assigns leave directly to an employee (no supervisor approval).
 */
export async function assignLeave(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");
  if (req.user.role !== "ADMIN" && req.user.role !== "HR")
    throw ApiError.forbidden("Only HR/Admin can assign leave");

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

  // Balance enforcement is disabled in this project.

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

  await createAuditLog({
    req,
    action: "LEAVE_ASSIGNED",
    module: "Leave",
    modelName: "LeaveRequest",
    actionType: "CREATE",
    targetId: String(leave._id),
    after: {
      status: leave.status,
      employeeId: String(employee._id),
      fromDate: start,
      toDate: end,
      days,
      typeId: String(typeId),
      reason: (reason || "").toString(),
    },
    approvedAt: now,
    approvedBy: req.user.id,
    decisionReason: "Assigned by HR/Admin",
    meta: { leaveId: String(leave._id) },
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
