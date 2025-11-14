// backend/src/modules/directory/directory.controller.ts
import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import mongoose from "mongoose";

// We assume Employee model exists here
// Path may differ in your project structure – adjust import if needed
import { Employee } from "../employees/employee.model";

export async function searchDirectory(req: Request, res: Response) {
  const { q, location, jobTitle, limit } = req.query;

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

  if (location && typeof location === "string") {
    filter.location = location;
  }

  if (jobTitle && typeof jobTitle === "string") {
    filter.jobTitle = jobTitle;
  }

  const max = limit ? Math.min(parseInt(limit as string, 10), 100) : 50;

  const employees = await Employee.find(filter)
    .sort({ firstName: 1, lastName: 1 })
    .limit(max)
    .lean();

  res.json(employees);
}
