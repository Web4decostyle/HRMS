import { Request, Response } from "express";
import { Employee } from "../employees/employee.model";
import { Supervisor } from "../my-info/reportTo/reportTo.model";

/** existing */
export async function searchDirectory(req: Request, res: Response) {
  const { q, location, jobTitle, department, limit } = req.query;

  const filter: any = {};

  if (q && typeof q === "string") {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phone: regex },
    ];
  }

  if (location && typeof location === "string" && location.trim()) {
    filter.location = location.trim();
  }

  if (jobTitle && typeof jobTitle === "string" && jobTitle.trim()) {
    filter.jobTitle = jobTitle.trim();
  }

  // ✅ NEW: department filter
  if (department && typeof department === "string" && department.trim()) {
    filter.department = department.trim();
  }

  const max = limit ? Math.min(parseInt(limit as string, 10), 200) : 50;

  const employees = await Employee.find(filter)
    .sort({ firstName: 1, lastName: 1 })
    .limit(max)
    .lean();

  res.json(employees);
}

/** existing */
export async function getEmployeeHierarchy(req: Request, res: Response) {
  const { employeeId } = req.params;

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  const supervisors = await Supervisor.find({ employeeId })
    .populate("supervisorId", "firstName lastName jobTitle email")
    .lean();

  const subRels = await Supervisor.find({ supervisorId: employeeId })
    .populate("employeeId", "firstName lastName jobTitle email")
    .lean();

  const subordinates = subRels.map((r: any) => ({
    _id: r._id,
    reportingMethod: r.reportingMethod,
    subordinateId: r.employeeId,
  }));

  res.json({ employee, supervisors, subordinates });
}

/**
 * ✅ NEW: Department counts
 * GET /api/directory/departments-summary
 * Optional query filters: location, jobTitle (and q if you want later)
 */
export async function getDepartmentsSummary(req: Request, res: Response) {
  const { location, jobTitle } = req.query;

  const match: any = {};

  if (location && typeof location === "string" && location.trim()) {
    match.location = location.trim();
  }
  if (jobTitle && typeof jobTitle === "string" && jobTitle.trim()) {
    match.jobTitle = jobTitle.trim();
  }

  const rows = await Employee.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $ifNull: ["$department", "Unassigned"] },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    {
      $project: {
        _id: 0,
        department: "$_id",
        count: 1,
      },
    },
  ]);

  res.json(rows);
}
