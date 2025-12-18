// backend/src/modules/employees/employee.controller.ts
import { Request, Response } from "express";
import { Employee } from "./employee.model";
import { ApiError } from "../../utils/ApiError"; 
import { AuthRequest } from "../../middleware/authMiddleware"; 
import { User } from "../auth/auth.model";
import { Counter } from "../pim/pimConfig/models/counter.model";

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

async function nextEmployeeId(prefix = "", pad = 4) {
  const c = await Counter.findOneAndUpdate(
    { key: "employeeId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `${prefix}${String(c.seq).padStart(pad, "0")}`;
}

export async function getMyEmployee(req: AuthRequest, res: Response) {
  const user = req.user;

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const dbUser = await User.findById(user.id).select("email username").lean();
  if (!dbUser) return res.status(404).json({ message: "User not found" });

  const email = (dbUser.email || "").trim();
  const username = (dbUser.username || "").trim();

  let employee =
    (email && (await Employee.findOne({ email }).lean())) ||
    (username && (await Employee.findOne({ email: username }).lean()));

  if (!employee) {
    const base = username || (email ? email.split("@")[0] : "New Employee");
    const parts = base.replace(/[._-]+/g, " ").trim().split(/\s+/);

    const firstName = parts[0] || "New";
    const lastName = parts.slice(1).join(" ") || "Employee";

    // ✅ generate required employeeId
    const employeeId = await nextEmployeeId("", 4); // => 0001, 0002...

    const created = await Employee.create({
      employeeId,
      firstName,
      lastName,
      email: email || username || undefined,
      status: "ACTIVE",
    });

    return res.json(created);
  }

  return res.json(employee);
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