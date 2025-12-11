import mongoose, { Document, Model, Schema } from "mongoose";

export interface EmploymentStatusDoc extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const employmentStatusSchema = new Schema<EmploymentStatusDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in ts-node-dev
export const EmploymentStatus: Model<EmploymentStatusDoc> =
  (mongoose.models.EmploymentStatus as Model<EmploymentStatusDoc>) ||
  mongoose.model<EmploymentStatusDoc>("EmploymentStatus", employmentStatusSchema);
