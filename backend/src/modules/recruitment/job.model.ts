// backend/src/modules/recruitment/job.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type JobStatus = "OPEN" | "CLOSED";

export interface IJob extends Document {
  title: string;
  code: string;
  description?: string;
  status: JobStatus;
  hiringManager?: mongoose.Types.ObjectId; // Employee
  createdBy?: mongoose.Types.ObjectId;     // User/Employee
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
    hiringManager: { type: Schema.Types.ObjectId, ref: "Employee" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

export const Job = mongoose.model<IJob>("Job", JobSchema);
