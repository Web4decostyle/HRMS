import mongoose, { Schema, Document } from "mongoose";

export interface IReportingMethod extends Document {
  name: string;
}

const ReportingMethodSchema = new Schema<IReportingMethod>(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

export const ReportingMethod = mongoose.model<IReportingMethod>(
  "ReportingMethod",
  ReportingMethodSchema
);
