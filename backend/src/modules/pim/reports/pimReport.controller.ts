import { Request, Response } from "express";
import { PimReport } from "./pimReport.model";

export const listPimReports = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || "";
    const filter: any = {};
    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    const reports = await PimReport.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(reports);
  } catch (err) {
    console.error("listPimReports error:", err);
    return res.status(500).json({ message: "Failed to load reports" });
  }
};

export const getPimReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const report = await PimReport.findById(id).lean();
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    return res.json(report);
  } catch (err) {
    console.error("getPimReport error:", err);
    return res.status(500).json({ message: "Failed to load report" });
  }
};

export const createPimReport = async (req: Request, res: Response) => {
  try {
    const { name, include, selectionCriteria, displayGroups } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Report name is required" });
    }

    const report = await PimReport.create({
      name: name.trim(),
      include: include || "CURRENT_ONLY",
      selectionCriteria: Array.isArray(selectionCriteria)
        ? selectionCriteria
        : [],
      displayGroups: Array.isArray(displayGroups) ? displayGroups : [],
    });

    return res.status(201).json(report);
  } catch (err) {
    console.error("createPimReport error:", err);
    return res.status(500).json({ message: "Failed to create report" });
  }
};

export const updatePimReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, include, selectionCriteria, displayGroups } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Report name is required" });
    }

    const updated = await PimReport.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        include: include || "CURRENT_ONLY",
        selectionCriteria: Array.isArray(selectionCriteria)
          ? selectionCriteria
          : [],
        displayGroups: Array.isArray(displayGroups) ? displayGroups : [],
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("updatePimReport error:", err);
    return res.status(500).json({ message: "Failed to update report" });
  }
};

export const deletePimReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await PimReport.findById(id);

    if (!existing) {
      return res.status(404).json({ message: "Report not found" });
    }

    await existing.deleteOne();
    return res.json({ success: true });
  } catch (err) {
    console.error("deletePimReport error:", err);
    return res.status(500).json({ message: "Failed to delete report" });
  }
};
