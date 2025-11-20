import { Request, Response } from "express";
import { Salary } from "./salary.model";
import mongoose from "mongoose";

// List salary components for employee
export async function listSalary(req: Request, res: Response) {
  const { employeeId } = req.params;

  const components = await Salary.find({ employeeId }).lean();
  res.json(components);
}

// Add salary component
export async function createSalary(req: Request, res: Response) {
  const { employeeId } = req.params;
  const data = req.body;

  const salary = await Salary.create({
    ...data,
    employeeId: new mongoose.Types.ObjectId(employeeId),
  });

  res.status(201).json(salary);
}

// Delete salary component
export async function deleteSalary(req: Request, res: Response) {
  const { salaryId } = req.params;

  const result = await Salary.findByIdAndDelete(salaryId);
  if (!result) {
    return res.status(404).json({ message: "Salary component not found" });
  }

  res.json({ success: true });
}
