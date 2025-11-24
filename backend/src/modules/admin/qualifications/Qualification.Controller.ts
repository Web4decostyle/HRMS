import { Request, Response } from "express";
import { Education } from "../qualifications/Education.model";
import { License } from "../qualifications/License.model";
import { Language } from "../qualifications/Language.model";


// ---------- EDUCATION ----------
export const getEducation = async (req: Request, res: Response) => {
  const records = await Education.find().sort({ createdAt: -1 });
  res.json(records);
};

export const createEducation = async (req: Request, res: Response) => {
  const { level } = req.body;
  if (!level) return res.status(400).json({ message: "Level is required" });
  const record = await Education.create({ level });
  res.status(201).json(record);
};

export const deleteEducation = async (req: Request, res: Response) => {
  await Education.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ---------- LICENSES ----------
export const getLicenses = async (req: Request, res: Response) => {
  const records = await License.find().sort({ createdAt: -1 });
  res.json(records);
};

export const createLicense = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  const record = await License.create({ name, description });
  res.status(201).json(record);
};

export const deleteLicense = async (req: Request, res: Response) => {
  await License.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

// ---------- LANGUAGES ----------
export const getLanguages = async (req: Request, res: Response) => {
  const records = await Language.find().sort({ createdAt: -1 });
  res.json(records);
};

export const createLanguage = async (req: Request, res: Response) => {
  const { name, fluency, competency } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  const record = await Language.create({ name, fluency, competency });
  res.status(201).json(record);
};

export const deleteLanguage = async (req: Request, res: Response) => {
  await Language.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
