import { Request, Response } from "express";
import mongoose from "mongoose";
import { Employee } from "../employees/employee.model";
import { Supervisor } from "../my-info/reportTo/reportTo.model";

/** ✅ Directory search (synced with divisions + subDivisions) */
export async function searchDirectory(req: Request, res: Response) {
  const { q, location, jobTitle, divisionId, subDivisionId, limit } = req.query;

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

  // ✅ division filter
  if (divisionId && typeof divisionId === "string" && divisionId.trim()) {
    if (mongoose.Types.ObjectId.isValid(divisionId)) {
      filter.division = new mongoose.Types.ObjectId(divisionId);
    }
  }

  // ✅ NEW: subDivision filter
  if (subDivisionId && typeof subDivisionId === "string" && subDivisionId.trim()) {
    if (mongoose.Types.ObjectId.isValid(subDivisionId)) {
      filter.subDivision = new mongoose.Types.ObjectId(subDivisionId);
    }
  }

  const max = limit ? Math.min(parseInt(limit as string, 10), 200) : 50;

  const employees = await Employee.find(filter)
    .populate("division", "name") // ✅ division name
    .populate("subDivision", "name division") // ✅ sub-division name (IMPORTANT)
    .sort({ firstName: 1, lastName: 1 })
    .limit(max)
    .lean();

  res.json(employees);
}

/** ✅ Hierarchy (shape matches frontend types) */
export async function getEmployeeHierarchy(req: Request, res: Response) {
  const { employeeId } = req.params;

  const employee = await Employee.findById(employeeId)
    .populate("division", "name")
    .populate("subDivision", "name division")
    .lean();

  if (!employee) return res.status(404).json({ message: "Employee not found" });

  // Employee -> Supervisor relationships
  // This returns docs like: { employeeId, supervisorId, reportingMethod }
  const relsUp = await Supervisor.find({ employeeId })
    .populate("supervisorId", "firstName lastName jobTitle email division subDivision")
    .lean();

  // Supervisor -> Employee relationships (direct reports)
  const relsDown = await Supervisor.find({ supervisorId: employeeId })
    .populate("employeeId", "firstName lastName jobTitle email division subDivision")
    .lean();

  // ✅ IMPORTANT: frontend expects `supervisorId` object and `subordinateId` object keys
  const supervisors = relsUp.map((r: any) => ({
    _id: r._id,
    reportingMethod: r.reportingMethod,
    supervisorId: r.supervisorId,
  }));

  const subordinates = relsDown.map((r: any) => ({
    _id: r._id,
    reportingMethod: r.reportingMethod,
    subordinateId: r.employeeId,
  }));

  res.json({ employee, supervisors, subordinates });
}

/**
 * ✅ Divisions summary
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
        from: "divisions",
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
