// backend/src/modules/employees/employee.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Employee } from "./employee.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { User } from "../auth/auth.model";
import { Counter } from "../pim/pimConfig/models/counter.model";
import { SubDivision } from "../divisions/subDivision.model";

export async function listEmployees(req: Request, res: Response) {
  const { name, employeeId, jobTitle, subUnit, status, include } =
    req.query as {
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

function toObjectId(id: unknown): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw ApiError.badRequest("Invalid ObjectId");
}

export async function updateEmployeeOrg(req: any, res: any) {
  const empId = toObjectId(req.params.id);

  const level = req.body?.level as
    | "MANAGER"
    | "TL"
    | "GRADE1"
    | "GRADE2"
    | undefined;

  const reportsToRaw = req.body?.reportsTo ?? null;

  const employee = await Employee.findById(empId);
  if (!employee) throw ApiError.notFound("Employee not found");

  // Set level if provided
  if (level) {
    employee.level = level;
  }

  // Normalize reportsTo
  let reportsTo: mongoose.Types.ObjectId | null = null;
  if (reportsToRaw) {
    reportsTo = toObjectId(reportsToRaw);
    const managerOrTl =
      await Employee.findById(reportsTo).select("level division");
    if (!managerOrTl) throw ApiError.badRequest("reportsTo employee not found");

    // If both have divisions, ensure same division (recommended)
    if (employee.division && managerOrTl.division) {
      if (String(employee.division) !== String(managerOrTl.division)) {
        throw ApiError.badRequest("reportsTo must be in the same division");
      }
    }
  }

  // Validate hierarchy rules
  const finalLevel = employee.level ?? "GRADE1";

  if (finalLevel === "MANAGER") {
    employee.reportsTo = null;
  } else if (finalLevel === "TL") {
    if (!reportsTo)
      throw ApiError.badRequest("TL must have reportsTo (MANAGER)");
    const boss = await Employee.findById(reportsTo).select("level");
    if (!boss || boss.level !== "MANAGER") {
      throw ApiError.badRequest("TL must report to a MANAGER");
    }
    employee.reportsTo = reportsTo;
  } else {
    // GRADE1 or GRADE2
    if (!reportsTo)
      throw ApiError.badRequest("Grade employees must have reportsTo (TL)");
    const boss = await Employee.findById(reportsTo).select("level");
    if (!boss || boss.level !== "TL") {
      throw ApiError.badRequest("Grade employees must report to a TL");
    }
    employee.reportsTo = reportsTo;
  }

  await employee.save();
  return res.json({ ok: true, employee });
}

export async function createEmployee(req: Request, res: Response) {
  const body = { ...req.body };

  // If a subDivision is provided, force division to match parent division
  if (body.subDivision) {
    const subId = toObjectId(body.subDivision);
    const sub = await SubDivision.findById(subId).select("division").lean();
    if (!sub) throw ApiError.badRequest("Sub-division not found");
    body.subDivision = subId;
    body.division = sub.division;
  }

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
    { new: true, upsert: true },
  );
  return `${prefix}${String(c.seq).padStart(pad, "0")}`;
}

/**
 * If username is a numeric EmpId (cardNo/payrollNo from excel),
 * use it as employeeId so attendance register matches automatically.
 */
function preferredEmployeeIdFromUsername(username: string) {
  const u = String(username || "").trim();
  if (!u) return "";
  // allow numeric only (you can widen later if needed)
  if (/^\d{1,20}$/.test(u)) return u;
  return "";
}

// ========================= lightweight meta (attendance register etc.) =========================
/**
 * POST /api/employees/meta-by-ids
 * Body: { employeeIds: string[] }
 * Returns: [{ employeeId, name, dept, designation }]
 */
export async function metaByEmployeeIds(req: AuthRequest, res: Response) {
  const raw = (req.body as any)?.employeeIds;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw ApiError.badRequest("employeeIds[] is required");
  }

  const employeeIds = raw
    .map((x: any) => String(x || "").trim())
    .filter(Boolean)
    .slice(0, 1000);

  if (!employeeIds.length) {
    throw ApiError.badRequest("employeeIds[] is empty");
  }

  const docs = await Employee.find({ employeeId: { $in: employeeIds } })
    .select("employeeId firstName lastName department jobTitle")
    .lean();

  return res.json(
    docs.map((e: any) => ({
      employeeId: String(e.employeeId),
      name: `${String(e.firstName || "")} ${String(e.lastName || "")}`.trim(),
      dept: String(e.department || ""),
      designation: String(e.jobTitle || ""),
    })),
  );
}

export async function getMyEmployee(req: AuthRequest, res: Response) {
  const user = req.user;

  if (!user?.id) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const dbUser = await User.findById(user.id).select("email username").lean();
  if (!dbUser) return res.status(404).json({ message: "User not found" });

  const email = String(dbUser.email || "").trim();
  const username = String(dbUser.username || "").trim();

  // ✅ IMPORTANT: also try employeeId == username (so excel cardNo/payrollNo can match)
  let employee =
    (email && (await Employee.findOne({ email }).lean())) ||
    (username && (await Employee.findOne({ email: username }).lean())) ||
    (username && (await Employee.findOne({ employeeId: username }).lean()));

  if (!employee) {
    const base = username || (email ? email.split("@")[0] : "New Employee");
    const parts = base
      .replace(/[._-]+/g, " ")
      .trim()
      .split(/\s+/);

    const firstName = parts[0] || "New";
    const lastName = parts.slice(1).join(" ") || "Employee";

    // ✅ If username is numeric, use it as employeeId (best for attendance register mapping)
    const preferred = preferredEmployeeIdFromUsername(username);
    const employeeId = preferred || (await nextEmployeeId("", 4)); // => 0001, 0002...

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
  const update = { ...req.body };

  // If a subDivision is provided, force division to match parent division
  if (update.subDivision !== undefined) {
    if (!update.subDivision) {
      update.subDivision = null;
    } else {
      const subId = toObjectId(update.subDivision);
      const sub = await SubDivision.findById(subId).select("division").lean();
      if (!sub) throw ApiError.badRequest("Sub-division not found");
      update.subDivision = subId;
      update.division = sub.division;
    }
  }

  // If division is explicitly cleared/changed, and subDivision isn't explicitly set,
  // clear subDivision to avoid inconsistent state.
  if (update.division !== undefined && update.subDivision === undefined) {
    update.subDivision = null;
  }

  const employee = await Employee.findByIdAndUpdate(id, update, {
    new: true,
  }).lean();

  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  res.json(employee);
}