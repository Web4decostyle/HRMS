// backend/src/modules/leave/leaveEntitlement/leaveEntitlement.controller.ts
import { Request, Response } from "express";
import { LeaveEntitlement } from "../leaveEntitlement/LeaveEntitlement.model";

interface AuthRequest extends Request {
  user?: any;
}

/**
 * POST /api/leave-entitlements
 * body: { employeeId, leaveTypeId, periodStart, periodEnd, days }
 * (for now only Individual employee – Multiple can be added later)
 */
export const createLeaveEntitlement = async (
  req: Request,
  res: Response
) => {
  try {
    const { employeeId, leaveTypeId, periodStart, periodEnd, days } = req.body;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee is required" });
    }
    if (!leaveTypeId) {
      return res.status(400).json({ message: "Leave type is required" });
    }
    if (!periodStart || !periodEnd) {
      return res.status(400).json({ message: "Leave period is required" });
    }
    if (days == null || Number.isNaN(Number(days))) {
      return res
        .status(400)
        .json({ message: "Entitlement days are required" });
    }

    // Create the document
    const entitlement = await LeaveEntitlement.create({
      employee: employeeId,
      leaveType: leaveTypeId,
      periodStart,
      periodEnd,
      days: Number(days),
    });

    // Populate on the created document (each populate returns a Promise)
    await entitlement.populate("employee", "employeeId firstName lastName");
    await entitlement.populate("leaveType", "name");

    res.status(201).json(entitlement);
  } catch (err) {
    console.error("createLeaveEntitlement error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getLeaveEntitlements = async (
  req: Request,
  res: Response
) => {
  try {
    const { employeeId, leaveTypeId, periodStart, periodEnd } = req.query as {
      employeeId?: string;
      leaveTypeId?: string;
      periodStart?: string;
      periodEnd?: string;
    };

    const filter: Record<string, any> = {};

    if (employeeId) filter.employee = employeeId;
    if (leaveTypeId) filter.leaveType = leaveTypeId;

    if (periodStart || periodEnd) {
      filter.periodStart = {};
      filter.periodEnd = {};
      if (periodStart) filter.periodStart.$gte = new Date(periodStart);
      if (periodEnd) filter.periodEnd.$lte = new Date(periodEnd);
    }

    const entitlements = await LeaveEntitlement.find(filter)
      .sort({ periodStart: 1 })
      .populate("employee", "employeeId firstName lastName")
      .populate("leaveType", "name");

    res.json(entitlements);
  } catch (err) {
    console.error("getLeaveEntitlements error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/leave-entitlements/my
 */
export const getMyLeaveEntitlements = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const entitlements = await LeaveEntitlement.find({ employee: userId })
      .sort({ periodStart: 1 })
      .populate("employee", "employeeId firstName lastName")
      .populate("leaveType", "name");

    res.json(entitlements);
  } catch (err) {
    console.error("getMyLeaveEntitlements error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/leave-entitlements/:id
 */
export const deleteLeaveEntitlement = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const existing = await LeaveEntitlement.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Entitlement not found" });
    }
    await existing.deleteOne();
    res.json({ message: "Entitlement deleted" });
  } catch (err) {
    console.error("deleteLeaveEntitlement error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
