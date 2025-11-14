// backend/src/modules/leave/leave.controller.ts
import { Request, Response } from "express";
import { LeaveType, LeaveRequest } from "./leave.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";

// LEAVE TYPES

export async function listLeaveTypes(_req: Request, res: Response) {
  const types = await LeaveType.find({ isActive: true }).lean();
  res.json(types);
}

export async function createLeaveType(req: Request, res: Response) {
  const { name, code } = req.body;
  if (!name || !code) {
    throw ApiError.badRequest("name and code are required");
  }

  const existing = await LeaveType.findOne({ code }).exec();
  if (existing) {
    throw new ApiError(409, "Leave type with this code already exists");
  }

  const type = await LeaveType.create({ name, code });
  res.status(201).json(type);
}

// LEAVE REQUESTS

// Employee creating own leave
export async function createLeaveRequest(req: AuthRequest, res: Response) {
  const { typeId, startDate, endDate, reason } = req.body;

  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }
  if (!typeId || !startDate || !endDate) {
    throw ApiError.badRequest("typeId, startDate and endDate are required");
  }

  const request = await LeaveRequest.create({
    employee: req.user.id,
    type: typeId,
    startDate,
    endDate,
    reason,
  });

  res.status(201).json(request);
}

// HR / Admin listing all leave
export async function listAllLeave(_req: Request, res: Response) {
  const items = await LeaveRequest.find()
    .populate("employee")
    .populate("type")
    .lean();

  res.json(items);
}

// Approve / reject
export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // APPROVED / REJECTED / CANCELLED

  if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const leave = await LeaveRequest.findById(id).exec();
  if (!leave) {
    throw ApiError.notFound("Leave request not found");
  }

  leave.status = status;
  await leave.save();

  res.json(leave);
}
