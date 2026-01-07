import { Request, Response, NextFunction } from "express";
import { PayGrade } from "./payGrade.model";

export async function listPayGrades(req: Request, res: Response, next: NextFunction) {
  try {
    const grades = await PayGrade.find().sort({ createdAt: -1 }).lean();
    res.json(grades);
  } catch (err) {
    next(err);
  }
}

export async function createPayGrade(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, currency, minSalary, maxSalary } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const existing = await PayGrade.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ message: "Pay grade already exists" });
    }

    const grade = await PayGrade.create({
      name: name.trim(),
      currency: currency?.trim() || undefined,
      minSalary: minSalary ?? undefined,
      maxSalary: maxSalary ?? undefined,
    });

    res.status(201).json(grade);
  } catch (err) {
    next(err);
  }
}

export async function updatePayGrade(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, currency, minSalary, maxSalary } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const trimmed = name.trim();
    const duplicate = await PayGrade.findOne({ name: trimmed, _id: { $ne: id } }).lean();
    if (duplicate) {
      return res.status(409).json({ message: "Pay grade name already exists" });
    }

    const grade = await PayGrade.findByIdAndUpdate(
      id,
      {
        name: trimmed,
        currency: currency?.trim() || undefined,
        minSalary: minSalary ?? undefined,
        maxSalary: maxSalary ?? undefined,
      },
      { new: true }
    );

    if (!grade) {
      return res.status(404).json({ message: "Pay grade not found" });
    }

    res.json(grade);
  } catch (err) {
    next(err);
  }
}

export async function deletePayGrade(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const grade = await PayGrade.findByIdAndDelete(id);
    if (!grade) {
      return res.status(404).json({ message: "Pay grade not found" });
    }
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
}
