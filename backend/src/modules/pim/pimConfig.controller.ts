import { Request, Response } from "express";
import { PimOptionalFields } from "./pimOptionalFields.model";
import { CustomField } from "./customField.model";

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
