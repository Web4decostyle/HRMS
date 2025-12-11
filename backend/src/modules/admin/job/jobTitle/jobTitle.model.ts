// backend/src/modules/admin/job/jobTitle.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface JobTitleDoc extends Document {
  name: string;
  description?: string;
  note?: string;
  specFilePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobTitleSchema = new Schema<JobTitleDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    note: { type: String, trim: true },
    specFilePath: { type: String },
  },
  { timestamps: true }
);

// IMPORTANT: reuse existing model if it already exists
export const JobTitle: Model<JobTitleDoc> =
  (mongoose.models.JobTitle as Model<JobTitleDoc>) ||
  mongoose.model<JobTitleDoc>("JobTitle", jobTitleSchema);
