// backend/src/modules/employees/employee.controller.ts
import { Request, Response } from "express";
import { Employee } from "./employee.model";
import { ApiError } from "../../utils/ApiError"; 
import { AuthRequest } from "../../middleware/authMiddleware"; 

export async function listEmployees(req: Request, res: Response) {
  const {
    name,
    employeeId,
    jobTitle,
    subUnit,
    status,
    include,
    
  } = req.query as {
    name?: string;
    employeeId?: string;
    jobTitle?: string;
    subUnit?: string;
    status?: "ACTIVE" | "INACTIVE";
    include?: "current" | "past" | "all";
  };

  const filter: any = {};

  // Name search => firstName or lastName
  if (name && name.trim().length > 0) {
    const pattern = new RegExp(name.trim(), "i");
    filter.$or = [{ firstName: pattern }, { lastName: pattern }];
  }

  // Employee ID search
  if (employeeId && employeeId.trim().length > 0) {
    filter.employeeId = { $regex: employeeId.trim(), $options: "i" };
  }

  // Job Title search (string field in your current schema)
  if (jobTitle && jobTitle.trim().length > 0) {
    filter.jobTitle = { $regex: jobTitle.trim(), $options: "i" };
  }

  // Sub Unit in UI => department in your model
  if (subUnit && subUnit.trim().length > 0) {
    filter.department = { $regex: subUnit.trim(), $options: "i" };
  }

  // Status filter: explicit status wins over include
  if (status) {
    filter.status = status;
  } else if (include === "current") {
    filter.status = "ACTIVE";
  } else if (include === "past") {
    filter.status = "INACTIVE";
  }
  // include === "all" => no explicit status filter

  const employees = await Employee.find(filter).lean();
  res.json(employees);
}

export async function createEmployee(req: Request, res: Response) {
  const body = req.body;
  const employee = await Employee.create(body);
  res.status(201).json(employee);
}

export async function getEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const employee = await Employee.findById(id).lean();
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  res.json(employee);
}

export async function getMyEmployee(req: AuthRequest, res: Response) {
  const user = req.user;

  // 1) Basic auth check
  if (!user) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  // Depending on how your token is built, email might be in user.email or not at all.
  const email = (user as any).email;
  const username = user.username;

  let employee = null;

  // 2) First try to match by email (best case)
  if (email) {
    employee = await Employee.findOne({ email }).lean();
  }

  // 3) Fallback: try matching by username (in case you use username as email/workEmail)
  if (!employee) {
    employee = await Employee.findOne({
      $or: [{ email: username }, { workEmail: username }],
    }).lean();
  }

  if (!employee) {
    return res
      .status(404)
      .json({ message: "Employee record not found for current user" });
  }

  res.json(employee);
}

export async function updateEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const update = req.body;

  const employee = await Employee.findByIdAndUpdate(id, update, {
    new: true,
  }).lean();

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.json(employee);
}