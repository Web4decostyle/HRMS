import { Request, Response, NextFunction } from "express";
import { JobTitle } from "./jobTitle.model";

export async function listJobTitles(req: Request, res: Response, next: NextFunction) {
  try {
    const titles = await JobTitle.find().sort({ createdAt: -1 }).lean();
    res.json(titles);
  } catch (err) {
    next(err);
  }
}

export async function createJobTitle(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, note } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Job title is required" });
    }

    const existing = await JobTitle.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Job title already exists" });
    }

    const specFilePath = req.file
      ? `/uploads/job-specs/${req.file.filename}`
      : undefined;

    const doc = await JobTitle.create({
      name: name.trim(),
      description: description?.trim() || undefined,
      note: note?.trim() || undefined,
      specFilePath,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}
