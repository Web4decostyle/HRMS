import { Request, Response } from "express";
import { Supervisor, Subordinate } from "./reportTo.model";
import mongoose from "mongoose";

// ------------------ SUPERVISORS ------------------

export async function listSupervisors(req: Request, res: Response) {
  const { employeeId } = req.params;

  const supervisors = await Supervisor.find({ employeeId })
    .populate("supervisorId", "firstName lastName jobTitle email")
    .lean();

  res.json(supervisors);
}

export async function addSupervisor(req: Request, res: Response) {
  const { employeeId } = req.params;
  const { supervisorId, reportingMethod } = req.body;

  const sup = await Supervisor.create({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    supervisorId,
    reportingMethod,
  });

  res.status(201).json(sup);
}

export async function deleteSupervisor(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await Supervisor.findByIdAndDelete(id);
  if (!deleted)
    return res.status(404).json({ message: "Supervisor not found" });

  res.json({ success: true });
}

// ------------------ SUBORDINATES ------------------

export async function listSubordinates(req: Request, res: Response) {
  const { employeeId } = req.params;

  const subs = await Subordinate.find({ employeeId })
    .populate("subordinateId", "firstName lastName jobTitle email")
    .lean();

  res.json(subs);
}

export async function addSubordinate(req: Request, res: Response) {
  const { employeeId } = req.params;
  const { subordinateId, reportingMethod } = req.body;

  const sub = await Subordinate.create({
    employeeId: new mongoose.Types.ObjectId(employeeId),
    subordinateId,
    reportingMethod,
  });

  res.status(201).json(sub);
}

export async function deleteSubordinate(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await Subordinate.findByIdAndDelete(id);
  if (!deleted)
    return res.status(404).json({ message: "Subordinate not found" });

  res.json({ success: true });
}
