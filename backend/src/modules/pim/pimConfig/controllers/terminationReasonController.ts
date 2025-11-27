import { Request, Response } from "express";
import { TerminationReason } from "../models/TerminationReason";

export const listTerminationReasons = async (req: Request, res: Response) => {
  try {
    const items = await TerminationReason.find().sort({ name: 1 }).lean();
    return res.json({
      items,
      total: items.length,
    });
  } catch (err) {
    console.error("listTerminationReasons error:", err);
    return res.status(500).json({ message: "Failed to load termination reasons" });
  }
};

export const createTerminationReason = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const trimmed = name.trim();

    const exists = await TerminationReason.findOne({
      name: { $regex: new RegExp(`^${trimmed}$`, "i") },
    });
    if (exists) {
      return res.status(409).json({ message: "Termination reason already exists" });
    }

    const item = await TerminationReason.create({ name: trimmed });
    return res.status(201).json(item);
  } catch (err) {
    console.error("createTerminationReason error:", err);
    return res.status(500).json({ message: "Failed to create termination reason" });
  }
};

export const updateTerminationReason = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required" });
    }

    const trimmed = name.trim();

    const exists = await TerminationReason.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${trimmed}$`, "i") },
    });

    if (exists) {
      return res.status(409).json({ message: "Termination reason already exists" });
    }

    const updated = await TerminationReason.findByIdAndUpdate(
      id,
      { name: trimmed },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Termination reason not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("updateTerminationReason error:", err);
    return res.status(500).json({ message: "Failed to update termination reason" });
  }
};

export const deleteTerminationReason = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await TerminationReason.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Termination reason not found" });
    }

    // In future, you can prevent delete if mapped to employees.
    await existing.deleteOne();

    return res.json({ success: true, id });
  } catch (err) {
    console.error("deleteTerminationReason error:", err);
    return res.status(500).json({ message: "Failed to delete termination reason" });
  }
};
