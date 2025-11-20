import { Request, Response } from "express";
import { Tax } from "./tax.model";
import mongoose from "mongoose";

// GET /api/my-info/employees/:employeeId/tax
export async function getTax(req: Request, res: Response) {
  const { employeeId } = req.params;

  const tax = await Tax.findOne({ employeeId }).lean();
  return res.json(tax || {});
}

// PUT /api/my-info/employees/:employeeId/tax
export async function upsertTax(req: Request, res: Response) {
  const { employeeId } = req.params;
  const data = req.body;

  const tax = await Tax.findOneAndUpdate(
    { employeeId: new mongoose.Types.ObjectId(employeeId) },
    data,
    { new: true, upsert: true }
  );

  res.json(tax);
}
