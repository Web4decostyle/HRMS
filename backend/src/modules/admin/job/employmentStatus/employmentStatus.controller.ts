import { Request, Response, NextFunction } from "express";
import { EmploymentStatus } from "./employmentStatus.model";

/** GET /api/admin/employment-status */
export async function listEmploymentStatuses(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await EmploymentStatus.find().sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/employment-status */
export async function createEmploymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await EmploymentStatus.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Employment status already exists" });
    }

    const doc = await EmploymentStatus.create({ name: name.trim() });
    return res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/employment-status/:id */
export async function updateEmploymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await EmploymentStatus.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/admin/employment-status/:id */
export async function deleteEmploymentStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await EmploymentStatus.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
}
