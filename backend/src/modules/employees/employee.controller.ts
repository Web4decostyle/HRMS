import { Request, Response } from "express";
import { Employee } from "./employee.model";

export async function listEmployees(_req: Request, res: Response) {
  const employees = await Employee.find().lean();
  res.json(employees);
}

export async function createEmployee(req: Request, res: Response) {
  const body = req.body;
  const employee = await Employee.create(body);
  res.status(201).json(employee);
}

export async function getEmployee(req: Request, res: Response) {
  const { id } = req.params;
  const employee = await Employee.findById(id).lean();
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  res.json(employee);
}
