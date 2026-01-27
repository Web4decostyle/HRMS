import { Request, Response } from "express";
import mongoose from "mongoose";
import { LeaveEntitlement } from "./LeaveEntitlement.model";
import { Employee } from "../../employees/employee.model";
import { LeaveType } from "../leave.model";
import { User } from "../../auth/auth.model";

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

const getEmployeeForUser = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  const employee = await Employee.findOne({ email: user.email }).lean();
  return employee;
};

/**
 * POST /api/leave-entitlements
 * Body: { employeeId, leaveTypeId, periodStart, periodEnd, days }
 */
export const createLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveTypeId, periodStart, periodEnd, days } = req.body;

    if (
      !employeeId ||
      !leaveTypeId ||
      !periodStart ||
      !periodEnd ||
      days == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidObjectId(employeeId) || !isValidObjectId(leaveTypeId)) {
      return res
        .status(400)
        .json({ message: "Invalid employeeId or leaveTypeId" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType)
      return res.status(404).json({ message: "Leave type not found" });

    const entitlement = await LeaveEntitlement.create({
      employee: employeeId,
      leaveType: leaveTypeId,
      periodStart,
      periodEnd,
      days,
    });

    const populated = await LeaveEntitlement.findById(entitlement._id)
      .populate("employee")
      .populate("leaveType")
      .lean();

    return res.status(201).json(populated);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error creating leave entitlement",
      error: error?.message || error,
    });
  }
};

/**
 * GET /api/leave-entitlements
 * Supports query filters:
 *  - employeeId
 *  - leaveTypeId
 *  - periodStart
 *  - periodEnd
 */
export const getLeaveEntitlements = async (req: Request, res: Response) => {
  try {
    const { employeeId, leaveTypeId, periodStart, periodEnd } = (req.query ||
      {}) as any;

    const query: any = {};

    if (employeeId) {
      if (!isValidObjectId(String(employeeId))) {
        return res.status(400).json({ message: "Invalid employeeId" });
      }
      query.employee = String(employeeId);
    }

    if (leaveTypeId) {
      if (!isValidObjectId(String(leaveTypeId))) {
        return res.status(400).json({ message: "Invalid leaveTypeId" });
      }
      query.leaveType = String(leaveTypeId);
    }

    // Period overlap filter:
    // - if periodStart provided -> entitlement.periodEnd >= periodStart
    // - if periodEnd provided   -> entitlement.periodStart <= periodEnd
    const and: any[] = [];

    if (periodStart) {
      const ps = new Date(String(periodStart));
      if (Number.isNaN(ps.getTime())) {
        return res.status(400).json({ message: "Invalid periodStart date" });
      }
      and.push({ periodEnd: { $gte: ps } });
    }

    if (periodEnd) {
      const pe = new Date(String(periodEnd));
      if (Number.isNaN(pe.getTime())) {
        return res.status(400).json({ message: "Invalid periodEnd date" });
      }
      and.push({ periodStart: { $lte: pe } });
    }

    if (and.length === 1) Object.assign(query, and[0]);
    if (and.length > 1) query.$and = and;

    const entitlements = await LeaveEntitlement.find(query)
      .populate("employee")
      .populate("leaveType");

    res.json(entitlements);
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching leave entitlements",
      error: error?.message || error,
    });
  }
};

/**
 * GET /api/leave-entitlements/my
 */
export const getMyLeaveEntitlements = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const employee = await getEmployeeForUser(userId);
    if (!employee)
      return res.status(404).json({ message: "Employee record not found" });

    const entitlements = await LeaveEntitlement.find({ employee: employee._id })
      .populate("leaveType")
      .lean();

    return res.json(entitlements);
  } catch (error: any) {
    return res.status(500).json({
      message: "Error fetching my entitlements",
      error: error?.message || error,
    });
  }
};

/**
 * DELETE /api/leave-entitlements/:id
 */
export const deleteLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const deleted = await LeaveEntitlement.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "Entitlement not found" });

    return res.json({ message: "Entitlement deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({
      message: "Error deleting entitlement",
      error: error?.message || error,
    });
  }
};
