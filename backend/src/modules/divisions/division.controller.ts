// backend/src/modules/divisions/division.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { Division } from "./division.model";
import { Employee } from "../employees/employee.model";
import { ApiError } from "../../utils/ApiError";

function toObjectId(id: unknown): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw ApiError.badRequest("Invalid ObjectId");
}

export async function listDivisions(_req: Request, res: Response) {
  const items = await Division.find().sort({ name: 1 }).lean();
  return res.json(items);
}

export async function createDivision(req: Request, res: Response) {
  const name = String(req.body?.name ?? "").trim();
  const code = String(req.body?.code ?? "").trim();
  const description = String(req.body?.description ?? "").trim();
  const managerEmployeeId = req.body?.managerEmployeeId;

  if (!name) throw ApiError.badRequest("Division name is required");

  let managerEmployee: mongoose.Types.ObjectId | null = null;
  if (managerEmployeeId) {
    managerEmployee = toObjectId(managerEmployeeId);
    const emp = await Employee.findById(managerEmployee);
    if (!emp) throw ApiError.badRequest("Manager employee not found");
  }

  const created = await Division.create({
    name,
    code: code || undefined,
    description: description || undefined,
    managerEmployee,
  });

  return res.status(201).json(created);
}

export async function updateDivision(req: Request, res: Response) {
  const id = toObjectId(req.params.id);

  const patch: any = {};
  if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();
  if (req.body?.code !== undefined) patch.code = String(req.body.code).trim();
  if (req.body?.description !== undefined)
    patch.description = String(req.body.description).trim();
  if (req.body?.isActive !== undefined) patch.isActive = !!req.body.isActive;

  if (req.body?.managerEmployeeId !== undefined) {
    const raw = req.body.managerEmployeeId;
    if (!raw) {
      patch.managerEmployee = null;
    } else {
      const managerEmployee = toObjectId(raw);
      const emp = await Employee.findById(managerEmployee);
      if (!emp) throw ApiError.badRequest("Manager employee not found");
      patch.managerEmployee = managerEmployee;
    }
  }

  const updated = await Division.findByIdAndUpdate(id, patch, { new: true });
  if (!updated) throw ApiError.notFound("Division not found");
  return res.json(updated);
}

export async function getDivisionOrgChart(req: any, res: any) {
  const divisionId = toObjectId(req.params.id);

  const division = await Division.findById(divisionId).lean();
  if (!division) throw ApiError.notFound("Division not found");

  const managerId = division.managerEmployee
    ? String(division.managerEmployee)
    : null;

  const manager = managerId
    ? await Employee.findById(managerId)
        .select("_id employeeId firstName lastName level division")
        .lean()
    : null;

  // TLs: in this division, level TL, reportsTo = manager
  const tls = await Employee.find({
    division: divisionId,
    level: "TL",
    ...(managerId ? { reportsTo: managerId } : {}),
  })
    .select("_id employeeId firstName lastName level reportsTo")
    .sort({ firstName: 1 })
    .lean();

  const tlIds = tls.map((t) => t._id);

  // Grades under TLs
  const grades = await Employee.find({
    division: divisionId,
    level: { $in: ["GRADE1", "GRADE2"] },
    reportsTo: { $in: tlIds },
  })
    .select("_id employeeId firstName lastName level reportsTo")
    .sort({ level: 1, firstName: 1 })
    .lean();

  // Group by TL
  const gradesByTl = new Map<string, any[]>();
  for (const g of grades) {
    const key = String(g.reportsTo);
    if (!gradesByTl.has(key)) gradesByTl.set(key, []);
    gradesByTl.get(key)!.push(g);
  }

  const tree = tls.map((tl) => ({
    tl,
    members: gradesByTl.get(String(tl._id)) ?? [],
  }));

  return res.json({
    division: { _id: division._id, name: division.name },
    manager,
    teams: tree,
  });
}

export async function deleteDivision(req: Request, res: Response) {
  const id = toObjectId(req.params.id);

  // Prevent deletion if employees are assigned to this division
  const assignedCount = await Employee.countDocuments({ division: id });
  if (assignedCount > 0) {
    throw ApiError.badRequest(
      "Cannot delete division while employees are assigned to it",
    );
  }

  const deleted = await Division.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Division not found");
  return res.json({ ok: true });
}
