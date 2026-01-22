import { Request, Response } from "express";
import mongoose from "mongoose";
import { LeaveEntitlement } from "../leaveEntitlement/LeaveEntitlement.model";
import { AuthRequest } from "../../../middleware/authMiddleware";
import { ApiError } from "../../../utils/ApiError";
import { User } from "../../auth/auth.model";
import { Employee } from "../../employees/employee.model";

function isValidObjectId(id: any) {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
}

async function getEmployeeForUser(userId: string) {
  const u = await User.findById(userId).select("email username").lean();
  if (!u) return null;

  const email = (u.email || "").trim();
  const username = (u.username || "").trim();

  const employee =
    (email && (await Employee.findOne({ email }).exec())) ||
    (username && (await Employee.findOne({ email: username }).exec()));

  return employee;
}

/**
 * POST /api/leave-entitlements
 * Frontend sends: employeeId, leaveTypeId, periodStart, periodEnd, days
 * DB expects: employee, leaveType, periodStart, periodEnd, days
 */
export const createLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    // accept both styles (employeeId/leaveTypeId OR employee/leaveType)
    const employeeId = body.employeeId || body.employee;
    const leaveTypeId = body.leaveTypeId || body.leaveType;

    if (!employeeId || !leaveTypeId) {
      return res.status(400).json({
        message: "employeeId and leaveTypeId are required",
      });
    }

    if (!isValidObjectId(String(employeeId))) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }
    if (!isValidObjectId(String(leaveTypeId))) {
      return res.status(400).json({ message: "Invalid leaveTypeId" });
    }

    const periodStart = body.periodStart;
    const periodEnd = body.periodEnd;
    const days = body.days;

    if (!periodStart || !periodEnd) {
      return res.status(400).json({
        message: "periodStart and periodEnd are required",
      });
    }
    if (days === undefined || days === null || Number(days) <= 0) {
      return res.status(400).json({
        message: "days must be a number greater than 0",
      });
    }

    const doc = await LeaveEntitlement.create({
      employee: new mongoose.Types.ObjectId(String(employeeId)),
      leaveType: new mongoose.Types.ObjectId(String(leaveTypeId)),
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      days: Number(days),
    });

    const populated = await LeaveEntitlement.findById(doc._id)
      .populate("employee")
      .populate("leaveType")
      .lean();

    res.status(201).json(populated);
  } catch (error: any) {
    // ✅ return 400 for mongoose validation / cast errors
    const isMongooseValidation =
      error?.name === "ValidationError" || error?.name === "CastError";

    res.status(isMongooseValidation ? 400 : 500).json({
      message: isMongooseValidation
        ? "Invalid entitlement payload"
        : "Error creating leave entitlement",
      error: error?.message || error,
    });
  }
};

export const getLeaveEntitlements = async (_req: Request, res: Response) => {
  try {
    const entitlements = await LeaveEntitlement.find()
      .populate("employee")
      .populate("leaveType");
    res.json(entitlements);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching leave entitlements", error: error?.message || error });
  }
};

export const getMyLeaveEntitlements = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const employee = await getEmployeeForUser(userId);
    if (!employee) throw ApiError.notFound("Employee record not found for this user");

    const entitlements = await LeaveEntitlement.find({ employee: employee._id })
      .populate("leaveType")
      .populate("employee");

    res.json(entitlements);
  } catch (error: any) {
    res.status(error?.statusCode || 500).json({
      message: error?.message || "Error fetching employee leave entitlements",
      error: error?.message || error,
    });
  }
};

export const updateLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // allow update payload in either style, normalize again
    const body = req.body || {};
    const employeeId = body.employeeId || body.employee;
    const leaveTypeId = body.leaveTypeId || body.leaveType;

    const update: any = { ...body };
    if (employeeId) update.employee = employeeId;
    if (leaveTypeId) update.leaveType = leaveTypeId;
    delete update.employeeId;
    delete update.leaveTypeId;

    const updated = await LeaveEntitlement.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("employee")
      .populate("leaveType");

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating leave entitlement", error: error?.message || error });
  }
};

export const deleteLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await LeaveEntitlement.findByIdAndDelete(id);
    res.json({ message: "Leave entitlement deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting leave entitlement", error: error?.message || error });
  }
};
