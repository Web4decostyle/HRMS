import mongoose, { Schema, Document } from "mongoose";

export interface IJobCategory extends Document {
  name: string;
}

const JobCategorySchema = new Schema<IJobCategory>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<IJobCategory>(
  "JobCategory",
  JobCategorySchema
);
