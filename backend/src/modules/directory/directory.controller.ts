import { Request, Response } from "express";
import mongoose from "mongoose";
import { Employee } from "../employees/employee.model";
import { Supervisor } from "../my-info/reportTo/reportTo.model";
import { Division } from "../divisions/division.model";

/** ✅ Directory search (synced with divisions) */
export async function searchDirectory(req: Request, res: Response) {
  const { q, location, jobTitle, divisionId, limit } = req.query;

  const filter: any = {};

  // text search
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

  // ✅ NEW: division filter
  if (divisionId && typeof divisionId === "string" && divisionId.trim()) {
    if (mongoose.Types.ObjectId.isValid(divisionId)) {
      filter.division = new mongoose.Types.ObjectId(divisionId);
    }
  }

  const max = limit ? Math.min(parseInt(limit as string, 10), 200) : 50;

  const employees = await Employee.find(filter)
    .populate("division", "name") // ✅ so directory can show division name
    .sort({ firstName: 1, lastName: 1 })
    .limit(max)
    .lean();

  res.json(employees);
}

/** existing */
export async function getEmployeeHierarchy(req: Request, res: Response) {
  const { employeeId } = req.params;

  const employee = await Employee.findById(employeeId)
    .populate("division", "name")
    .lean();

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
 * ✅ NEW: Divisions summary
 * GET /api/directory/divisions-summary?location=&jobTitle=
 */
export async function getDivisionsSummary(req: Request, res: Response) {
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
        _id: { $ifNull: ["$division", null] },
        count: { $sum: 1 },
      },
    },

    {
      $lookup: {
        from: "divisions", // collection for Division model
        localField: "_id",
        foreignField: "_id",
        as: "division",
      },
    },
    { $unwind: { path: "$division", preserveNullAndEmptyArrays: true } },

    {
      $project: {
        _id: 0,
        divisionId: {
          $cond: [{ $ifNull: ["$_id", false] }, { $toString: "$_id" }, ""],
        },
        divisionName: { $ifNull: ["$division.name", "Unassigned"] },
        count: 1,
      },
    },

    { $sort: { count: -1, divisionName: 1 } },
  ]);

  res.json(rows);
}
