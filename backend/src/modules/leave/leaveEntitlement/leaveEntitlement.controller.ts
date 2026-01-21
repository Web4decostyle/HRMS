import { Request, Response } from "express";
import { LeaveEntitlement } from "../leaveEntitlement/LeaveEntitlement.model";
import { AuthRequest } from "../../../middleware/authMiddleware";
import { ApiError } from "../../../utils/ApiError";
import { User } from "../../auth/auth.model";
import { Employee } from "../../employees/employee.model";

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

export const createLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const entitlement = new LeaveEntitlement(req.body);
    await entitlement.save();
    res.status(201).json(entitlement);
  } catch (error) {
    res.status(500).json({ message: "Error creating leave entitlement", error });
  }
};

export const getLeaveEntitlements = async (_req: Request, res: Response) => {
  try {
    const entitlements = await LeaveEntitlement.find()
      .populate("employee")
      .populate("leaveType");
    res.json(entitlements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leave entitlements", error });
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
      error,
    });
  }
};

export const updateLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await LeaveEntitlement.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating leave entitlement", error });
  }
};

export const deleteLeaveEntitlement = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await LeaveEntitlement.findByIdAndDelete(id);
    res.json({ message: "Leave entitlement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting leave entitlement", error });
  }
};
