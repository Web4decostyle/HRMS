import { Request, Response } from "express";
import { PimOptionalFields } from "./pimOptionalFields.model";
import { CustomField } from "./customField.model";
import { ReportingMethod } from "./reportingMethod.model";


/* ============================================================
   OPTIONAL FIELDS
============================================================ */

export const getOptionalFields = async (req: Request, res: Response) => {
  const data =
    (await PimOptionalFields.findOne()) ||
    (await PimOptionalFields.create({}));

  return res.json({ success: true, data });
};

export const updateOptionalFields = async (req: Request, res: Response) => {
  const existing =
    (await PimOptionalFields.findOne()) ||
    (await PimOptionalFields.create({}));

  const updated = await PimOptionalFields.findByIdAndUpdate(
    existing._id,
    req.body,
    { new: true }
  );

  return res.json({ success: true, data: updated });
};

/* ============================================================
   CUSTOM FIELDS
============================================================ */

export const getCustomFields = async (req: Request, res: Response) => {
  const data = await CustomField.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
};

export const createCustomField = async (req: Request, res: Response) => {
  const { fieldName, screen, type, dropdownOptions, required } = req.body;

  if (!fieldName || !screen || !type) {
    return res
      .status(400)
      .json({ success: false, message: "Required fields missing" });
  }

  if (type === "dropdown" && (!dropdownOptions || dropdownOptions.length === 0)) {
    return res
      .status(400)
      .json({ success: false, message: "Dropdown options required" });
  }

  const newField = await CustomField.create({
    fieldName,
    screen,
    type,
    dropdownOptions,
    required,
    active: true,
  });

  res.status(201).json({ success: true, data: newField });
};

export const deleteCustomField = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await CustomField.findByIdAndDelete(id);

  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, message: "Field not found" });
  }

  res.json({ success: true, message: "Field removed" });
};

/* ============================================================
   REPORTING METHODS
============================================================ */

export const getReportingMethods = async (req: Request, res: Response) => {
  const data = await ReportingMethod.find().sort({ name: 1 }).lean();
  res.json({ success: true, data });
};

export const createReportingMethod = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  const trimmed = name.trim();

  const existing = await ReportingMethod.findOne({
    name: { $regex: `^${trimmed}$`, $options: "i" },
  });

  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Reporting method already exists" });
  }

  const newMethod = await ReportingMethod.create({ name: trimmed });

  res.status(201).json({ success: true, data: newMethod });
};

export const updateReportingMethod = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  const trimmed = name.trim();

  const existing = await ReportingMethod.findOne({
    _id: { $ne: id },
    name: { $regex: `^${trimmed}$`, $options: "i" },
  });

  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Reporting method already exists" });
  }

  const updated = await ReportingMethod.findByIdAndUpdate(
    id,
    { name: trimmed },
    { new: true }
  );

  if (!updated) {
    return res
      .status(404)
      .json({ success: false, message: "Reporting method not found" });
  }

  res.json({ success: true, data: updated });
};

export const deleteReportingMethod = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deleted = await ReportingMethod.findByIdAndDelete(id);

  if (!deleted) {
    return res
      .status(404)
      .json({ success: false, message: "Reporting method not found" });
  }

  res.json({ success: true, message: "Reporting method removed" });
};
