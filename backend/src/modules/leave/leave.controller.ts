import { Request, Response } from "express";
import mongoose from "mongoose";
import { LeaveType, LeaveRequest } from "./leave.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { notifyRoles, notifyUsers } from "../notifications/notify.utils";
import { Employee } from "../employees/employee.model";
import { Supervisor } from "../my-info/reportTo/reportTo.model";
import { User } from "../auth/auth.model";
import { Counter } from "../pim/pimConfig/models/counter.model";

/**
 * Convert ANYTHING into ObjectId safely for typing + runtime.
 * This is the key to fixing "unknown is not assignable to ObjectId".
 */
function toObjectId(id: unknown): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw ApiError.badRequest("Invalid ObjectId");
}

function toObjectIdOrNull(id: unknown): mongoose.Types.ObjectId | null {
  if (!id) return null;
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  return null;
}

// helper: map DB document → API shape expected by frontend
function mapLeave(doc: any) {
  const approvalStep = doc?.approval?.step;
  const pendingWith =
    doc?.status === "PENDING"
      ? approvalStep === 1
        ? "SUPERVISOR"
        : approvalStep === 2
        ? "HR"
        : null
      : null;

  return {
    ...doc,
    fromDate: doc.startDate,
    toDate: doc.endDate,
    pendingWith,
  };
}

async function nextEmployeeId(prefix = "", pad = 4) {
  const c = await Counter.findOneAndUpdate(
    { key: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(c.seq).padStart(pad, "0")}`;
}

async function ensureEmployeeForUser(userId: string) {
  const u = await User.findById(userId)
    .select("email username firstName lastName")
    .lean();
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
 * ✅ IMPORTANT FIX:
 * Accept `unknown` (because your employee._id is typed unknown in your project),
 * then normalize it inside this function.
 */
async function findDirectSupervisorEmployeeId(
  employeeId: unknown
): Promise<mongoose.Types.ObjectId | null> {
  const empId = toObjectId(employeeId); // <-- normalize here

  const rel = await Supervisor.findOne({ employeeId: empId })
    .sort({ createdAt: 1 })
    .lean();

  // rel?.supervisorId might be unknown too
  return toObjectIdOrNull((rel as any)?.supervisorId);
}

async function findUserIdByEmployeeEmail(email?: string | null) {
  const e = (email || "").trim();
  if (!e) return null;

  const u = await User.findOne({
    $or: [{ email: e }, { username: e }],
  })
    .collation({ locale: "en", strength: 2 })
    .select("_id")
    .lean();

  return u?._id ? String(u._id) : null;
}

function calcDaysInclusive(start: Date, end: Date) {
  const a = new Date(start);
  const b = new Date(end);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  const diffMs = b.getTime() - a.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/* ============================= LEAVE TYPES ============================= */

export async function listLeaveTypes(_req: Request, res: Response) {
  const types = await LeaveType.find({ isActive: true }).lean();
  res.json(types);
}

export async function createLeaveType(req: Request, res: Response) {
  const { name, code } = req.body;

  if (!name || !name.trim()) throw ApiError.badRequest("name is required");

  const finalCode =
    (code && String(code).trim()) ||
    name.trim().toUpperCase().replace(/\s+/g, "_");

  const existing = await LeaveType.findOne({ code: finalCode }).exec();
  if (existing) throw new ApiError(409, "Leave type with this code already exists");

  const type = await LeaveType.create({
    name: name.trim(),
    code: finalCode,
  });

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

export async function createLeaveRequest(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { typeId, fromDate, toDate, reason, startDate, endDate } = req.body;
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

  const days = calcDaysInclusive(start, end);
  const employee = await ensureEmployeeForUser(req.user.id);

  // ✅ NO MORE TS ERROR HERE, because function accepts unknown now
  const supervisorEmployeeId = await findDirectSupervisorEmployeeId((employee as any)._id);

  const step = supervisorEmployeeId ? 1 : 2;

  const request = await LeaveRequest.create({
    employee: (employee as any)._id,
    type: typeId,
    startDate: start,
    endDate: end,
    reason,
    days,
    approval: {
      step,
      supervisorEmployee: supervisorEmployeeId || undefined,
      supervisorAction: "PENDING",
      hrAction: "PENDING",
    },
  });

  if (step === 1 && supervisorEmployeeId) {
    const sup = await Employee.findById(supervisorEmployeeId)
      .select("email firstName lastName")
      .lean();

    const supUserId = await findUserIdByEmployeeEmail((sup as any)?.email);

    if (supUserId) {
      await notifyUsers({
        userIds: [supUserId],
        title: "Leave Request Needs Your Approval",
        message: `${(employee as any).firstName || "Employee"} ${(employee as any).lastName || ""} applied for leave (${days} day(s)).`,
        type: "LEAVE",
        link: "/leave/list",
        meta: { leaveId: request._id },
      });
    } else {
      await notifyRoles({
        roles: ["HR"],
        title: "Leave Request Submitted (No Supervisor User Found)",
        message: `${(employee as any).firstName || "Employee"} ${(employee as any).lastName || ""} applied for leave (${days} day(s)).`,
        type: "LEAVE",
        link: "/leave/list",
        meta: { leaveId: request._id },
      });
    }
  } else {
    await notifyRoles({
      roles: ["HR"],
      title: "Leave Request Needs HR Approval",
      message: `${(employee as any).firstName || "Employee"} ${(employee as any).lastName || ""} applied for leave (${days} day(s)).`,
      type: "LEAVE",
      link: "/leave/list",
      meta: { leaveId: request._id },
    });
  }

  res.status(201).json(mapLeave(request.toObject()));
}

export async function listMyLeave(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { fromDate, toDate, status, typeId } = req.query as any;
  const employee = await ensureEmployeeForUser(req.user.id);

  const query: any = { employee: (employee as any)._id };
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
    query["approval.supervisorEmployee"] = (actingEmployee as any)._id;
  }

  const items = await LeaveRequest.find(query)
    .populate("employee")
    .populate("type")
    .lean();

  res.json(items.map(mapLeave));
}

export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status, remarks } = req.body;

  if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const leave = await LeaveRequest.findById(id)
    .populate("employee")
    .populate("type")
    .exec();

  if (!leave) throw ApiError.notFound("Leave request not found");
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const now = new Date();
  const role = req.user.role;
  const actingEmployee = await ensureEmployeeForUser(req.user.id);

  const employeeDoc: any = leave.employee as any;
  const employeeUserId = await findUserIdByEmployeeEmail(employeeDoc?.email);

  if (status === "CANCELLED") {
    if (String(employeeDoc?._id || leave.employee) !== String((actingEmployee as any)._id)) {
      throw ApiError.forbidden("You can only cancel your own leave request");
    }
    if (leave.status !== "PENDING") {
      throw ApiError.badRequest("Only pending leave requests can be cancelled");
    }

    leave.status = "CANCELLED";
    leave.approval.step = 3;
    await leave.save();

    await notifyRoles({
      roles: ["HR"],
      title: "Leave Cancelled",
      message: `${employeeDoc?.firstName || "Employee"} ${employeeDoc?.lastName || ""} cancelled a leave request.`,
      type: "LEAVE",
      link: "/leave/list",
      meta: { leaveId: leave._id },
    });

    res.json(mapLeave(leave.toObject()));
    return;
  }

  if (leave.status !== "PENDING") {
    throw ApiError.badRequest("Only pending leave requests can be approved/rejected");
  }

  const step = leave.approval?.step || 1;

  if (step === 1) {
    const supervisorEmployeeId = leave.approval?.supervisorEmployee;

    const isAdminOverride = role === "ADMIN";
    const isSupervisorMatch =
      supervisorEmployeeId &&
      String(supervisorEmployeeId) === String((actingEmployee as any)._id);

    if (!isAdminOverride && !isSupervisorMatch) {
      throw ApiError.forbidden("Only the assigned supervisor can act on this request");
    }

    if (status === "REJECTED") {
      leave.status = "REJECTED";
      leave.approval.step = 3;
      leave.approval.supervisorAction = "REJECTED";
      leave.approval.supervisorActedBy = toObjectId(req.user.id);
      leave.approval.supervisorActedAt = now;
      leave.approval.supervisorRemarks = remarks;
      await leave.save();

      if (employeeUserId) {
        await notifyUsers({
          userIds: [employeeUserId],
          title: "Leave Rejected",
          message: "Your leave request was rejected by your supervisor.",
          type: "LEAVE",
          link: "/leave/my-leave",
          meta: { leaveId: leave._id },
        });
      }

      res.json(mapLeave(leave.toObject()));
      return;
    }

    if (status === "APPROVED") {
      leave.approval.supervisorAction = "APPROVED";
      leave.approval.supervisorActedBy = toObjectId(req.user.id);
      leave.approval.supervisorActedAt = now;
      leave.approval.supervisorRemarks = remarks;
      leave.approval.step = 2;
      await leave.save();

      await notifyRoles({
        roles: ["HR"],
        title: "Leave Request Needs HR Approval",
        message: `${employeeDoc?.firstName || "Employee"} ${employeeDoc?.lastName || ""} has a leave request approved by supervisor and waiting for HR.`,
        type: "LEAVE",
        link: "/leave/list",
        meta: { leaveId: leave._id },
      });

      res.json(mapLeave(leave.toObject()));
      return;
    }
  }

  if (step === 2) {
    const isHrOrAdmin = role === "HR" || role === "ADMIN";
    if (!isHrOrAdmin) throw ApiError.forbidden("Only HR can act on this request at this stage");

    if (status === "REJECTED") {
      leave.status = "REJECTED";
      leave.approval.step = 3;
      leave.approval.hrAction = "REJECTED";
      leave.approval.hrActedBy = toObjectId(req.user.id);
      leave.approval.hrActedAt = now;
      leave.approval.hrRemarks = remarks;
      await leave.save();

      if (employeeUserId) {
        await notifyUsers({
          userIds: [employeeUserId],
          title: "Leave Rejected",
          message: "Your leave request was rejected by HR.",
          type: "LEAVE",
          link: "/leave/my-leave",
          meta: { leaveId: leave._id },
        });
      }

      res.json(mapLeave(leave.toObject()));
      return;
    }

    if (status === "APPROVED") {
      leave.status = "APPROVED";
      leave.approval.step = 3;
      leave.approval.hrAction = "APPROVED";
      leave.approval.hrActedBy = toObjectId(req.user.id);
      leave.approval.hrActedAt = now;
      leave.approval.hrRemarks = remarks;
      await leave.save();

      if (employeeUserId) {
        await notifyUsers({
          userIds: [employeeUserId],
          title: "Leave Approved",
          message: "Your leave request was approved by HR.",
          type: "LEAVE",
          link: "/leave/my-leave",
          meta: { leaveId: leave._id },
        });
      }

      res.json(mapLeave(leave.toObject()));
      return;
    }
  }

  throw ApiError.badRequest("Invalid approval state");
}

export async function assignLeave(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const role = req.user.role;
  if (role !== "ADMIN" && role !== "HR") {
    throw ApiError.forbidden("Only HR/Admin can assign leave");
  }

  const { employeeId, typeId, fromDate, toDate, reason, startDate, endDate } = req.body;
  const effectiveFrom = fromDate || startDate;
  const effectiveTo = toDate || endDate;

  if (!employeeId || !typeId || !effectiveFrom || !effectiveTo) {
    throw ApiError.badRequest("employeeId, typeId, fromDate and toDate are required");
  }

  const employee = await Employee.findById(employeeId).exec();
  if (!employee) throw ApiError.notFound("Employee not found");

  const start = new Date(effectiveFrom);
  const end = new Date(effectiveTo);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw ApiError.badRequest("Invalid date format");
  }

  const days = calcDaysInclusive(start, end);

  const leave = await LeaveRequest.create({
    employee: (employee as any)._id,
    type: typeId,
    startDate: start,
    endDate: end,
    reason,
    days,
    status: "APPROVED",
    approval: {
      step: 3,
      supervisorEmployee: undefined,
      supervisorAction: "APPROVED",
      hrAction: "APPROVED",
      hrActedBy: toObjectId(req.user.id),
      hrActedAt: new Date(),
      hrRemarks: "Assigned by HR/Admin",
    },
  });

  const employeeUserId = await findUserIdByEmployeeEmail((employee as any).email);
  if (employeeUserId) {
    await notifyUsers({
      userIds: [employeeUserId],
      title: "Leave Assigned",
      message: `A leave (${days} day(s)) was assigned to you by ${role}.`,
      type: "LEAVE",
      link: "/leave/my-leave",
      meta: { leaveId: leave._id },
    });
  }

  res.status(201).json(mapLeave(leave.toObject()));
}
