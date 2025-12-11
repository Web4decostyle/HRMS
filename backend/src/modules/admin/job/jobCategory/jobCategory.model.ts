import mongoose, { Document, Model, Schema } from "mongoose";

export interface JobCategoryDoc extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobCategorySchema = new Schema<JobCategoryDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

// avoid OverwriteModelError with ts-node-dev
export const JobCategory: Model<JobCategoryDoc> =
  (mongoose.models.JobCategory as Model<JobCategoryDoc>) ||
  mongoose.model<JobCategoryDoc>("JobCategory", jobCategorySchema);
