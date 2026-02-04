// backend/src/modules/divisions/subDivision.controller.ts
import { Request, Response } from "express";
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { Employee } from "../employees/employee.model";
import { Division } from "./division.model";
import { SubDivision } from "./subDivision.model";

function toObjectId(id: unknown): mongoose.Types.ObjectId {
  if (id instanceof mongoose.Types.ObjectId) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id)) {
    return new mongoose.Types.ObjectId(id);
  }
  throw ApiError.badRequest("Invalid ObjectId");
}

async function ensureDivision(divisionId: mongoose.Types.ObjectId) {
  const d = await Division.findById(divisionId).select("_id").lean();
  if (!d) throw ApiError.notFound("Division not found");
}

function toObjectIdArray(input: unknown): mongoose.Types.ObjectId[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((x) => (typeof x === "string" ? x : (x as any)?._id))
    .filter(Boolean)
    .map((x) => toObjectId(x));
}

async function ensureEmployeesExist(ids: mongoose.Types.ObjectId[]) {
  if (ids.length === 0) return;
  const count = await Employee.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw ApiError.badRequest("One or more TL employees not found");
  }
}

export async function listSubDivisions(req: Request, res: Response) {
  const divisionId = toObjectId((req.params as any).divisionId);
  await ensureDivision(divisionId);

  const items = await SubDivision.find({ division: divisionId })
    .sort({ name: 1 })
    // ✅ Populate so frontend can show TL names (optional but useful)
    .populate("tlEmployees", "firstName lastName employeeId")
    .lean();

  return res.json(items);
}

export async function createSubDivision(req: Request, res: Response) {
  const divisionId = toObjectId((req.params as any).divisionId);
  await ensureDivision(divisionId);

  const name = String(req.body?.name ?? "").trim();
  const code = String(req.body?.code ?? "").trim();
  const description = String(req.body?.description ?? "").trim();

  // ✅ read tlEmployees from body
  const tlEmployees = toObjectIdArray(req.body?.tlEmployees);
  await ensureEmployeesExist(tlEmployees);

  if (!name) throw ApiError.badRequest("Sub-division name is required");

  const created = await SubDivision.create({
    division: divisionId,
    name,
    code: code || undefined,
    description: description || undefined,
    tlEmployees,
  });

  const populated = await SubDivision.findById(created._id)
    .populate("tlEmployees", "firstName lastName employeeId")
    .lean();

  return res.status(201).json(populated);
}

export async function updateSubDivision(req: Request, res: Response) {
  const divisionId = toObjectId((req.params as any).divisionId);
  const id = toObjectId(req.params.id);
  await ensureDivision(divisionId);

  const existing = await SubDivision.findOne({ _id: id, division: divisionId });
  if (!existing) throw ApiError.notFound("Sub-division not found");

  const patch: any = {};
  if (req.body?.name !== undefined) patch.name = String(req.body.name).trim();
  if (req.body?.code !== undefined) patch.code = String(req.body.code).trim();
  if (req.body?.description !== undefined)
    patch.description = String(req.body.description).trim();
  if (req.body?.isActive !== undefined) patch.isActive = !!req.body.isActive;

  // ✅ allow TL update
  if (req.body?.tlEmployees !== undefined) {
    const tlEmployees = toObjectIdArray(req.body.tlEmployees);
    await ensureEmployeesExist(tlEmployees);
    patch.tlEmployees = tlEmployees;
  }

  const updated = await SubDivision.findByIdAndUpdate(id, patch, { new: true })
    .populate("tlEmployees", "firstName lastName employeeId")
    .lean();

  return res.json(updated);
}

export async function deleteSubDivision(req: Request, res: Response) {
  const divisionId = toObjectId((req.params as any).divisionId);
  const id = toObjectId(req.params.id);
  await ensureDivision(divisionId);

  const existing = await SubDivision.findOne({ _id: id, division: divisionId });
  if (!existing) throw ApiError.notFound("Sub-division not found");

  // Prevent deletion if employees are assigned to this sub-division
  const assignedCount = await Employee.countDocuments({ subDivision: id });
  if (assignedCount > 0) {
    throw ApiError.badRequest(
      "Cannot delete sub-division while employees are assigned to it"
    );
  }

  await SubDivision.deleteOne({ _id: id, division: divisionId });
  return res.json({ ok: true });
}