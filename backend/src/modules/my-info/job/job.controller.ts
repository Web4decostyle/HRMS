import { Request, Response } from "express";
import { Job } from "./job.model";
import mongoose from "mongoose";

export async function getJob(req: Request, res: Response) {
  const { employeeId } = req.params;

  const job = await Job.findOne({ employeeId }).lean();
  return res.json(job || {});
}

export async function upsertJob(req: Request, res: Response) {
  const { employeeId } = req.params;
  const data = req.body;

  const job = await Job.findOneAndUpdate(
    { employeeId: new mongoose.Types.ObjectId(employeeId) },
    data,
    { new: true, upsert: true }
  );

  return res.json(job);
}
