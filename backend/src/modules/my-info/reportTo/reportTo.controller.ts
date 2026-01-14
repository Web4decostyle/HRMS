import { Request, Response } from "express";
import mongoose from "mongoose";
import { Supervisor, Subordinate } from "./reportTo.model";

function isMongoDup(err: any) {
  return err?.code === 11000;
}

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(String(id));
}

/**
 * If employee A reports to supervisor B:
 * - Supervisor doc: { employeeId: A, supervisorId: B }
 * - Subordinate doc: { employeeId: B, subordinateId: A }
 *
 * We keep both collections in sync so UI + future reporting stays consistent.
 */

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
  const { supervisorId, reportingMethod } = req.body as {
    supervisorId: string;
    reportingMethod?: string;
  };

  if (!supervisorId) return res.status(400).json({ message: "supervisorId is required" });

  if (String(employeeId) === String(supervisorId)) {
    return res.status(400).json({ message: "Employee cannot report to self." });
  }

  try {
    // ✅ Create Supervisor relation (A -> B)
    const sup = await Supervisor.create({
      employeeId: toObjectId(employeeId),
      supervisorId: toObjectId(supervisorId),
      reportingMethod: reportingMethod || "Direct",
    });

    // ✅ Auto-create reciprocal Subordinate relation (B has subordinate A)
    await Subordinate.updateOne(
      { employeeId: toObjectId(supervisorId), subordinateId: toObjectId(employeeId) },
      { $set: { reportingMethod: reportingMethod || "Direct" } },
      { upsert: true }
    );

    res.status(201).json(sup);
  } catch (err: any) {
    if (isMongoDup(err)) {
      return res.status(409).json({ message: "Supervisor relation already exists." });
    }
    throw err;
  }
}

export async function deleteSupervisor(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await Supervisor.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Supervisor not found" });

  // ✅ Remove reciprocal Subordinate relation if exists
  await Subordinate.deleteOne({
    employeeId: deleted.supervisorId,
    subordinateId: deleted.employeeId,
  });

  res.json({ success: true });
}

// ------------------ SUBORDINATES ------------------

export async function listSubordinates(req: Request, res: Response) {
  const { employeeId } = req.params;

  /**
   * ✅ Best source of truth:
   * Find all Supervisor docs where supervisorId == employeeId
   * That means "employeeId has these subordinates"
   */
  const fromSupervisor = await Supervisor.find({ supervisorId: employeeId })
    .populate("employeeId", "firstName lastName jobTitle email")
    .lean();

  // Map to shape your frontend expects: { subordinateId: populatedEmployee }
  const shaped = fromSupervisor.map((row: any) => ({
    _id: row._id,
    subordinateId: row.employeeId,
    reportingMethod: row.reportingMethod,
  }));

  res.json(shaped);
}

export async function addSubordinate(req: Request, res: Response) {
  const { employeeId } = req.params; // this is the "manager"
  const { subordinateId, reportingMethod } = req.body as {
    subordinateId: string;
    reportingMethod?: string;
  };

  if (!subordinateId) return res.status(400).json({ message: "subordinateId is required" });

  if (String(employeeId) === String(subordinateId)) {
    return res.status(400).json({ message: "Employee cannot be own subordinate." });
  }

  try {
    // ✅ Create Subordinate record (manager -> subordinate)
    const sub = await Subordinate.create({
      employeeId: toObjectId(employeeId),
      subordinateId: toObjectId(subordinateId),
      reportingMethod: reportingMethod || "Direct",
    });

    // ✅ Auto-create Supervisor record (subordinate reports to manager)
    await Supervisor.updateOne(
      { employeeId: toObjectId(subordinateId), supervisorId: toObjectId(employeeId) },
      { $set: { reportingMethod: reportingMethod || "Direct" } },
      { upsert: true }
    );

    res.status(201).json(sub);
  } catch (err: any) {
    if (isMongoDup(err)) {
      return res.status(409).json({ message: "Subordinate relation already exists." });
    }
    throw err;
  }
}

export async function deleteSubordinate(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await Subordinate.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: "Subordinate not found" });

  // ✅ Remove reciprocal Supervisor relation if exists
  await Supervisor.deleteOne({
    employeeId: deleted.subordinateId,
    supervisorId: deleted.employeeId,
  });

  res.json({ success: true });
}
