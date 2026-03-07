import { Request, Response } from "express";
import { Employee } from "./employee.model";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { User } from "../auth/auth.model";
import { Counter } from "../pim/pimConfig/models/counter.model";
import mongoose from "mongoose";
import { SubDivision } from "../divisions/subDivision.model";
import { Division } from "../divisions/division.model";

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

  if (name && name.trim().length > 0) {
    const pattern = new RegExp(name.trim(), "i");
    filter.$or = [{ firstName: pattern }, { lastName: pattern }];
  }

  if (employeeId && employeeId.trim().length > 0) {
    filter.employeeId = { $regex: employeeId.trim(), $options: "i" };
  }

  if (jobTitle && jobTitle.trim().length > 0) {
    filter.jobTitle = { $regex: jobTitle.trim(), $options: "i" };
  }

  if (subUnit && subUnit.trim().length > 0) {
    filter.department = { $regex: subUnit.trim(), $options: "i" };
  }

  if (status) {
    filter.status = status;
  } else if (include === "current") {
    filter.status = "ACTIVE";
  } else if (include === "past") {
    filter.status = "INACTIVE";
  }

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

async function resolveDivisionId(value: any) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (mongoose.Types.ObjectId.isValid(raw)) {
    const found = await Division.findById(raw).select("_id").lean();
    return found?._id ?? null;
  }

  const found = await Division.findOne({
    name: { $regex: `^${raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  })
    .select("_id")
    .lean();

  return found?._id ?? null;
}

async function resolveSubDivisionId(value: any) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (mongoose.Types.ObjectId.isValid(raw)) {
    const found = await SubDivision.findById(raw).select("_id division").lean();
    return found ?? null;
  }

  const found = await SubDivision.findOne({
    name: { $regex: `^${raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  })
    .select("_id division")
    .lean();

  return found ?? null;
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

  if (level) {
    employee.level = level;
  }

  let reportsTo: mongoose.Types.ObjectId | null = null;
  if (reportsToRaw) {
    reportsTo = toObjectId(reportsToRaw);
    const managerOrTl = await Employee.findById(reportsTo).select("level division");
    if (!managerOrTl) throw ApiError.badRequest("reportsTo employee not found");

    if (employee.division && managerOrTl.division) {
      if (String(employee.division) !== String(managerOrTl.division)) {
        throw ApiError.badRequest("reportsTo must be in the same division");
      }
    }
  }

  const finalLevel = employee.level ?? "GRADE1";

  if (finalLevel === "MANAGER") {
    employee.reportsTo = null;
  } else if (finalLevel === "TL") {
    if (!reportsTo) throw ApiError.badRequest("TL must have reportsTo (MANAGER)");
    const boss = await Employee.findById(reportsTo).select("level");
    if (!boss || boss.level !== "MANAGER") {
      throw ApiError.badRequest("TL must report to a MANAGER");
    }
    employee.reportsTo = reportsTo;
  } else {
    if (!reportsTo) {
      throw ApiError.badRequest("Grade employees must have reportsTo (TL)");
    }
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

export async function bulkImportEmployees(req: Request, res: Response) {
  const rows = Array.isArray(req.body?.employees) ? req.body.employees : [];

  if (!rows.length) {
    throw ApiError.badRequest("employees array is required");
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors: Array<{ row: number; employeeId?: string; message: string }> = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index] || {};

    try {
      const employeeId = String(row.employeeId || "").trim();
      const firstName = String(row.firstName || "").trim();
      const middleName = String(row.middleName || "").trim();
      const lastName = String(row.lastName || "").trim();
      const email = String(row.email || "").trim();
      const phone = String(row.phone || "").trim();
      const jobTitle = String(row.jobTitle || "").trim();
      const department = String(row.department || "").trim();
      const location = String(row.location || "").trim();
      const status =
        String(row.status || "").trim().toUpperCase() === "INACTIVE"
          ? "INACTIVE"
          : "ACTIVE";

      if (!employeeId) {
        skipped += 1;
        errors.push({
          row: index + 2,
          employeeId: "",
          message: "Employee ID is required",
        });
        continue;
      }

      if (!firstName || !lastName) {
        skipped += 1;
        errors.push({
          row: index + 2,
          employeeId,
          message: "First name and last name are required",
        });
        continue;
      }

      let division: mongoose.Types.ObjectId | null = null;
      let subDivision: mongoose.Types.ObjectId | null = null;

      const resolvedDivision = await resolveDivisionId(row.division);
      if (resolvedDivision) {
        division = resolvedDivision as mongoose.Types.ObjectId;
      }

      const resolvedSubDivision = await resolveSubDivisionId(row.subDivision);
      if (resolvedSubDivision?._id) {
        subDivision = resolvedSubDivision._id as mongoose.Types.ObjectId;
        division = resolvedSubDivision.division as mongoose.Types.ObjectId;
      }

      const payload: any = {
        employeeId,
        firstName,
        lastName,
        email: email || `no-email+${employeeId}@example.com`,
        status,
      };

      if (middleName) payload.middleName = middleName;
      if (phone) payload.phone = phone;
      if (jobTitle) payload.jobTitle = jobTitle;
      if (department) payload.department = department;
      if (location) payload.location = location;
      if (division) payload.division = division;
      if (subDivision) payload.subDivision = subDivision;

      const existing = await Employee.findOne({ employeeId }).select("_id").lean();

      if (existing?._id) {
        await Employee.findByIdAndUpdate(existing._id, payload, { new: true });
        updated += 1;
      } else {
        await Employee.create(payload);
        created += 1;
      }
    } catch (err: any) {
      skipped += 1;
      errors.push({
        row: index + 2,
        employeeId: String(rows[index]?.employeeId || ""),
        message: err?.message || "Failed to import row",
      });
    }
  }

  return res.json({
    ok: true,
    total: rows.length,
    created,
    updated,
    skipped,
    errors,
  });
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

    const employeeId = await nextEmployeeId("", 4);

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