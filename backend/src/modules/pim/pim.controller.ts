// backend/src/modules/pim/pim.controller.ts
import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import {
  EmergencyContact,
  Dependent,
  Education,
  WorkExperience,
} from "./pim.model";

/*
  NOTE: For now we trust that req.params.employeeId is a valid Employee _id.
  You can add extra validation (check Employee exists) if you want.
*/

function getEmployeeIdFromParams(req: Request) {
  const { employeeId } = req.params;
  if (!employeeId) {
    throw ApiError.badRequest("employeeId is required in URL");
  }
  return employeeId;
}

/* ========== Emergency Contacts ========== */

// GET /api/pim/employees/:employeeId/emergency-contacts
export async function listEmergencyContacts(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const items = await EmergencyContact.find({ employee: employeeId })
    .sort({ name: 1 })
    .lean();
  res.json(items);
}

// POST /api/pim/employees/:employeeId/emergency-contacts
export async function createEmergencyContact(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const { name, relationship, homePhone, mobilePhone, workPhone } = req.body;

  if (!name) {
    throw ApiError.badRequest("name is required");
  }

  const item = await EmergencyContact.create({
    employee: employeeId,
    name,
    relationship,
    homePhone,
    mobilePhone,
    workPhone,
  });

  res.status(201).json(item);
}

// DELETE /api/pim/employees/:employeeId/emergency-contacts/:id
export async function deleteEmergencyContact(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await EmergencyContact.findByIdAndDelete(id).exec();
  if (!deleted) {
    throw ApiError.notFound("Emergency contact not found");
  }
  res.status(204).send();
}

/* ========== Dependents ========== */

// GET /api/pim/employees/:employeeId/dependents
export async function listDependents(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const items = await Dependent.find({ employee: employeeId })
    .sort({ name: 1 })
    .lean();
  res.json(items);
}

// POST /api/pim/employees/:employeeId/dependents
export async function createDependent(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const { name, relationship, dateOfBirth } = req.body;

  if (!name) {
    throw ApiError.badRequest("name is required");
  }

  const item = await Dependent.create({
    employee: employeeId,
    name,
    relationship,
    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
  });

  res.status(201).json(item);
}

// DELETE /api/pim/employees/:employeeId/dependents/:id
export async function deleteDependent(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Dependent.findByIdAndDelete(id).exec();
  if (!deleted) {
    throw ApiError.notFound("Dependent not found");
  }
  res.status(204).send();
}

/* ========== Education ========== */

// GET /api/pim/employees/:employeeId/education
export async function listEducation(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const items = await Education.find({ employee: employeeId })
    .sort({ year: -1 })
    .lean();
  res.json(items);
}

// POST /api/pim/employees/:employeeId/education
export async function createEducation(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const { level, institute, major, year, score } = req.body;

  const item = await Education.create({
    employee: employeeId,
    level,
    institute,
    major,
    year,
    score,
  });

  res.status(201).json(item);
}

// DELETE /api/pim/employees/:employeeId/education/:id
export async function deleteEducation(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await Education.findByIdAndDelete(id).exec();
  if (!deleted) {
    throw ApiError.notFound("Education record not found");
  }
  res.status(204).send();
}

/* ========== Work Experience ========== */

// GET /api/pim/employees/:employeeId/experience
export async function listWorkExperience(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const items = await WorkExperience.find({ employee: employeeId })
    .sort({ fromDate: -1 })
    .lean();
  res.json(items);
}

// POST /api/pim/employees/:employeeId/experience
export async function createWorkExperience(req: Request, res: Response) {
  const employeeId = getEmployeeIdFromParams(req);
  const { employer, jobTitle, fromDate, toDate, comment } = req.body;

  if (!employer) {
    throw ApiError.badRequest("employer is required");
  }

  const item = await WorkExperience.create({
    employee: employeeId,
    employer,
    jobTitle,
    fromDate: fromDate ? new Date(fromDate) : undefined,
    toDate: toDate ? new Date(toDate) : undefined,
    comment,
  });

  res.status(201).json(item);
}

// DELETE /api/pim/employees/:employeeId/experience/:id
export async function deleteWorkExperience(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await WorkExperience.findByIdAndDelete(id).exec();
  if (!deleted) {
    throw ApiError.notFound("Work experience record not found");
  }
  res.status(204).send();
}
