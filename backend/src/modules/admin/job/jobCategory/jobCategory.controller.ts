import { Request, Response, NextFunction } from "express";
import { JobCategory } from "./jobCategory.model";

/** GET /api/admin/job-categories */
export async function listJobCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await JobCategory.find().sort({ createdAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/job-categories */
export async function createJobCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await JobCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Job category already exists" });
    }

    const doc = await JobCategory.create({ name: name.trim() });
    return res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

/** PUT /api/admin/job-categories/:id */
export async function updateJobCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await JobCategory.findByIdAndUpdate(
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

/** DELETE /api/admin/job-categories/:id */
export async function deleteJobCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await JobCategory.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
}
