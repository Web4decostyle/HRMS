// backend/src/modules/my-info/job.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  employee: mongoose.Types.ObjectId;
  joinedDate?: Date;
  jobTitle?: string;
  jobCategory?: string;
  subUnit?: string;
  location?: string;
  employmentStatus?: string;
  includeContractDetails?: boolean;
}

const JobSchema = new Schema<IJob>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    joinedDate: Date,
    jobTitle: String,
    jobCategory: String,
    subUnit: String,
    location: String,
    employmentStatus: String,
    includeContractDetails: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ⬇️ THIS LINE is the important part
export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
