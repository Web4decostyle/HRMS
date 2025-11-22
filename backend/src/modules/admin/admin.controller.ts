// backend/src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import {
  OrgUnit,
  JobTitle,
  PayGrade,
  Location,
  EmploymentStatus,
  JobCategory,
  WorkShift,
  GeneralInfo,
  Skill,
  Language,
  License,
  Nationality,
} from "./admin.model";

import { Education } from "../pim/pim.model";


/* ================= ORG UNITS ================= */

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

export async function updateOrgUnit(req: Request, res: Response) {
  const { id } = req.params;
  const { name, code, parent, description } = req.body;

  const unit = await OrgUnit.findById(id);
  if (!unit) throw ApiError.notFound("Org unit not found");

  if (name !== undefined) unit.name = name;
  if (code !== undefined) unit.code = code;
  if (parent !== undefined) unit.parent = parent || null;
  if (description !== undefined) unit.description = description;

  await unit.save();
  res.json(unit);
}

export async function deleteOrgUnit(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await OrgUnit.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Org unit not found");
  res.status(204).send();
}

/* ================= JOB TITLES ================= */

export async function listJobTitles(_req: Request, res: Response) {
  const items = await JobTitle.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createJobTitle(req: Request, res: Response) {
  const { name, code, description } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const exists = await JobTitle.findOne({ name });
  if (exists) throw ApiError.conflict("Job title already exists");

  const jt = await JobTitle.create({ name, code, description });
  res.status(201).json(jt);
}

export async function updateJobTitle(req: Request, res: Response) {
  const { id } = req.params;
  const { name, code, description } = req.body;

  const jt = await JobTitle.findById(id);
  if (!jt) throw ApiError.notFound("Job title not found");

  if (name !== undefined) jt.name = name;
  if (code !== undefined) jt.code = code;
  if (description !== undefined) jt.description = description;

  await jt.save();
  res.json(jt);
}

export async function deleteJobTitle(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await JobTitle.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Job title not found");
  res.status(204).send();
}

/* ================= PAY GRADES ================= */

export async function listPayGrades(_req: Request, res: Response) {
  const items = await PayGrade.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createPayGrade(req: Request, res: Response) {
  const { name, currency, minSalary, maxSalary } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const exists = await PayGrade.findOne({ name });
  if (exists) throw ApiError.conflict("Pay grade already exists");

  const pg = await PayGrade.create({ name, currency, minSalary, maxSalary });
  res.status(201).json(pg);
}

export async function updatePayGrade(req: Request, res: Response) {
  const { id } = req.params;
  const { name, currency, minSalary, maxSalary } = req.body;

  const pg = await PayGrade.findById(id);
  if (!pg) throw ApiError.notFound("Pay grade not found");

  if (name !== undefined) pg.name = name;
  if (currency !== undefined) pg.currency = currency;
  if (minSalary !== undefined) pg.minSalary = minSalary;
  if (maxSalary !== undefined) pg.maxSalary = maxSalary;

  await pg.save();
  res.json(pg);
}

export async function deletePayGrade(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await PayGrade.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Pay grade not found");
  res.status(204).send();
}

/* ================= EMPLOYMENT STATUS ================= */

export async function listEmploymentStatuses(_req: Request, res: Response) {
  const items = await EmploymentStatus.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createEmploymentStatus(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest("name is required");
  const exists = await EmploymentStatus.findOne({ name });
  if (exists) throw ApiError.conflict("Employment status already exists");

  const es = await EmploymentStatus.create({ name });
  res.status(201).json(es);
}

export async function updateEmploymentStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  const es = await EmploymentStatus.findById(id);
  if (!es) throw ApiError.notFound("Employment status not found");

  if (name !== undefined) es.name = name;
  await es.save();
  res.json(es);
}

export async function deleteEmploymentStatus(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await EmploymentStatus.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Employment status not found");
  res.status(204).send();
}

/* ================= JOB CATEGORIES ================= */

export async function listJobCategories(_req: Request, res: Response) {
  const items = await JobCategory.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createJobCategory(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest("name is required");
  const exists = await JobCategory.findOne({ name });
  if (exists) throw ApiError.conflict("Job category already exists");

  const jc = await JobCategory.create({ name });
  res.status(201).json(jc);
}

export async function updateJobCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  const jc = await JobCategory.findById(id);
  if (!jc) throw ApiError.notFound("Job category not found");

  if (name !== undefined) jc.name = name;
  await jc.save();
  res.json(jc);
}

export async function deleteJobCategory(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await JobCategory.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Job category not found");
  res.status(204).send();
}

/* ================= WORK SHIFTS ================= */

export async function listWorkShifts(_req: Request, res: Response) {
  const items = await WorkShift.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createWorkShift(req: Request, res: Response) {
  const { name, hoursPerDay } = req.body;
  if (!name) throw ApiError.badRequest("name is required");
  if (hoursPerDay == null)
    throw ApiError.badRequest("hoursPerDay is required");

  const exists = await WorkShift.findOne({ name });
  if (exists) throw ApiError.conflict("Work shift already exists");

  const ws = await WorkShift.create({ name, hoursPerDay });
  res.status(201).json(ws);
}

export async function updateWorkShift(req: Request, res: Response) {
  const { id } = req.params;
  const { name, hoursPerDay } = req.body;

  const ws = await WorkShift.findById(id);
  if (!ws) throw ApiError.notFound("Work shift not found");

  if (name !== undefined) ws.name = name;
  if (hoursPerDay !== undefined) ws.hoursPerDay = hoursPerDay;
  await ws.save();
  res.json(ws);
}

export async function deleteWorkShift(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await WorkShift.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Work shift not found");
  res.status(204).send();
}

/* ================= LOCATIONS ================= */

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

export async function updateLocation(req: Request, res: Response) {
  const { id } = req.params;
  const { name, city, country, address } = req.body;

  const loc = await Location.findById(id);
  if (!loc) throw ApiError.notFound("Location not found");

  if (name !== undefined) loc.name = name;
  if (city !== undefined) loc.city = city;
  if (country !== undefined) loc.country = country;
  if (address !== undefined) loc.address = address;

  await loc.save();
  res.json(loc);
}

export async function deleteLocation(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Location.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Location not found");
  res.status(204).send();
}

/* ================= GENERAL ORG INFO ================= */

export async function getGeneralInfo(_req: Request, res: Response) {
  const info = await GeneralInfo.findOne().lean();
  res.json(info || null);
}

export async function upsertGeneralInfo(req: Request, res: Response) {
  const payload = req.body || {};

  let info = await GeneralInfo.findOne();
  if (!info) {
    info = new GeneralInfo(payload);
  } else {
    Object.assign(info, payload);
  }

  await info.save();
  res.json(info);
}

/* ================= QUALIFICATIONS: SKILLS ================= */

export async function listSkills(_req: Request, res: Response) {
  const items = await Skill.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createSkill(req: Request, res: Response) {
  const { name, description } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const exists = await Skill.findOne({ name });
  if (exists) throw ApiError.conflict("Skill already exists");

  const skill = await Skill.create({ name, description });
  res.status(201).json(skill);
}

export async function updateSkill(req: Request, res: Response) {
  const { id } = req.params;
  const { name, description } = req.body;

  const skill = await Skill.findById(id);
  if (!skill) throw ApiError.notFound("Skill not found");

  if (name !== undefined) skill.name = name;
  if (description !== undefined) skill.description = description;
  await skill.save();
  res.json(skill);
}

export async function deleteSkill(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Skill.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Skill not found");
  res.status(204).send();
}

/* ================= QUALIFICATIONS: EDUCATION ================= */

export async function listEducationLevels(_req: Request, res: Response) {
  const items = await Education.find().sort({ level: 1 }).lean();
  res.json(items);
}

export async function createEducationLevel(req: Request, res: Response) {
  const { level } = req.body;
  if (!level) throw ApiError.badRequest("level is required");

  const exists = await Education.findOne({ level });
  if (exists) throw ApiError.conflict("Education level already exists");

  const ed = await Education.create({ level });
  res.status(201).json(ed);
}

export async function updateEducationLevel(req: Request, res: Response) {
  const { id } = req.params;
  const { level } = req.body;

  const ed = await Education.findById(id);
  if (!ed) throw ApiError.notFound("Education level not found");

  if (level !== undefined) ed.level = level;
  await ed.save();
  res.json(ed);
}

export async function deleteEducationLevel(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Education.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Education level not found");
  res.status(204).send();
}

/* ================= QUALIFICATIONS: LANGUAGES ================= */

export async function listLanguages(_req: Request, res: Response) {
  const items = await Language.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createLanguage(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const exists = await Language.findOne({ name });
  if (exists) throw ApiError.conflict("Language already exists");

  const lang = await Language.create({ name });
  res.status(201).json(lang);
}

export async function updateLanguage(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  const lang = await Language.findById(id);
  if (!lang) throw ApiError.notFound("Language not found");

  if (name !== undefined) lang.name = name;
  await lang.save();
  res.json(lang);
}

export async function deleteLanguage(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Language.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Language not found");
  res.status(204).send();
}

/* ================= QUALIFICATIONS: LICENSES ================= */

export async function listLicenses(_req: Request, res: Response) {
  const items = await License.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createLicense(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const exists = await License.findOne({ name });
  if (exists) throw ApiError.conflict("License already exists");

  const lic = await License.create({ name });
  res.status(201).json(lic);
}

export async function updateLicense(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  const lic = await License.findById(id);
  if (!lic) throw ApiError.notFound("License not found");

  if (name !== undefined) lic.name = name;
  await lic.save();
  res.json(lic);
}

export async function deleteLicense(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await License.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("License not found");
  res.status(204).send();
}

/* ================= NATIONALITIES ================= */

export async function listNationalities(_req: Request, res: Response) {
  const items = await Nationality.find().sort({ name: 1 }).lean();
  res.json(items);
}

export async function createNationality(req: Request, res: Response) {
  const { name } = req.body;
  if (!name) throw ApiError.badRequest("name is required");

  const exists = await Nationality.findOne({ name });
  if (exists) throw ApiError.conflict("Nationality already exists");

  const nat = await Nationality.create({ name });
  res.status(201).json(nat);
}

export async function updateNationality(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  const nat = await Nationality.findById(id);
  if (!nat) throw ApiError.notFound("Nationality not found");

  if (name !== undefined) nat.name = name;
  await nat.save();
  res.json(nat);
}

export async function deleteNationality(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Nationality.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("Nationality not found");
  res.status(204).send();
}
