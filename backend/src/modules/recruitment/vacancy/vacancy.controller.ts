import { Request, Response, NextFunction } from "express";
import { Vacancy } from "./vacancy.model";
import mongoose from "mongoose";
import { Employee } from "../../employees/employee.model";

function fullNameFromEmployee(e: any) {
  const first = (e?.firstName ?? "").trim();
  const last = (e?.lastName ?? "").trim();
  const full = `${first} ${last}`.trim();
  return full || e?.email || "—";
}

// GET /api/recruitment/vacancies
export async function listVacancies(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await Vacancy.find()
      .populate("job", "title code")
      .sort({ createdAt: -1 })
      .lean();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

// POST /api/recruitment/vacancies
// body: { jobId, name, hiringManagerEmployeeId?, hiringManagerName?, status? }
export async function createVacancy(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      jobId,
      name,
      hiringManagerEmployeeId,
      hiringManagerName,
      status,
    } = req.body as {
      jobId?: string;
      name?: string;
      hiringManagerEmployeeId?: string;
      hiringManagerName?: string;
      status?: "OPEN" | "CLOSED";
    };

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "jobId is required" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Vacancy name is required" });
    }

    let hmEmpId: mongoose.Types.ObjectId | undefined;
    let hmName: string | undefined = hiringManagerName?.trim() || undefined;
    let hmEmail: string | undefined;

    // ✅ If frontend sends employeeId, resolve name/email reliably
    if (hiringManagerEmployeeId) {
      if (!mongoose.isValidObjectId(hiringManagerEmployeeId)) {
        return res.status(400).json({ message: "Invalid hiringManagerEmployeeId" });
      }
      const emp = await Employee.findById(hiringManagerEmployeeId).lean();
      if (!emp) return res.status(404).json({ message: "Hiring manager employee not found" });

      hmEmpId = new mongoose.Types.ObjectId(hiringManagerEmployeeId);
      hmName = fullNameFromEmployee(emp);
      hmEmail = (emp.email ?? "").trim().toLowerCase() || undefined;
    }

    const vacancy = await Vacancy.create({
      job: jobId,
      name: name.trim(),
      hiringManagerEmployeeId: hmEmpId,
      hiringManagerName: hmName,
      hiringManagerEmail: hmEmail,
      status: status || "OPEN",
    });

    const populated = await vacancy.populate("job", "title code");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}
