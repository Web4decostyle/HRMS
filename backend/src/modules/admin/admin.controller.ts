// backend/src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import {
  OrgUnit,
  JobTitle,
  PayGrade,
  Location,
} from "./admin.model";

/* ===== Org Units ===== */

export async function listOrgUnits(_req: Request, res: Response) {
  const items = await OrgUnit.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createOrgUnit(req: Request, res: Response) {
  const { name, code, parent, description } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const unit = await OrgUnit.create({ name, code, parent, description });
  res.status(201).json(unit);
}

/* ===== Job Titles ===== */

export async function listJobTitles(_req: Request, res: Response) {
  const items = await JobTitle.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createJobTitle(req: Request, res: Response) {
  const { name, code, description } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const existing = code ? await JobTitle.findOne({ code }).exec() : null;
  if (existing) throw new ApiError(409, "Job title code already exists");

  const item = await JobTitle.create({ name, code, description });
  res.status(201).json(item);
}

/* ===== Pay Grades ===== */

export async function listPayGrades(_req: Request, res: Response) {
  const items = await PayGrade.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createPayGrade(req: Request, res: Response) {
  const { name, currency, minSalary, maxSalary } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const existing = await PayGrade.findOne({ name }).exec();
  if (existing) throw new ApiError(409, "Pay grade already exists");

  const item = await PayGrade.create({ name, currency, minSalary, maxSalary });
  res.status(201).json(item);
}

/* ===== Locations ===== */

export async function listLocations(_req: Request, res: Response) {
  const items = await Location.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createLocation(req: Request, res: Response) {
  const { name, city, country, address } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const loc = await Location.create({ name, city, country, address });
  res.status(201).json(loc);
}
