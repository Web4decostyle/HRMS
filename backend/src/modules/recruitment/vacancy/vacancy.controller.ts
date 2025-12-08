import { Request, Response, NextFunction } from "express";
import { Vacancy } from "./vacancy.model";
import mongoose from "mongoose";

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
// body: { jobId, name, hiringManagerName?, status? }
export async function createVacancy(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId, name, hiringManagerName, status } = req.body as {
      jobId?: string;
      name?: string;
      hiringManagerName?: string;
      status?: "OPEN" | "CLOSED";
    };

    if (!jobId || !mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "jobId is required" });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Vacancy name is required" });
    }

    const vacancy = await Vacancy.create({
      job: jobId,
      name: name.trim(),
      hiringManagerName: hiringManagerName?.trim(),
      status: status || "OPEN",
    });

    const populated = await vacancy.populate("job", "title code");

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
}
