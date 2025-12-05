import { Schema, model, Document } from "mongoose";

export interface PimReportDisplayGroupSchema {
  groupKey: string;
  includeHeader: boolean;
  fields: string[];
}

export interface PimReportDocument extends Document {
  name: string;
  include: "CURRENT_ONLY" | "CURRENT_AND_PAST";
  selectionCriteria: string[];
  displayGroups: PimReportDisplayGroupSchema[];
  createdAt: Date;
  updatedAt: Date;
}

const displayGroupSchema = new Schema<PimReportDisplayGroupSchema>(
  {
    groupKey: { type: String, required: true },
    includeHeader: { type: Boolean, default: false },
    fields: [{ type: String }],
  },
  { _id: false }
);

const pimReportSchema = new Schema<PimReportDocument>(
  {
    name: { type: String, required: true, trim: true },
    include: {
      type: String,
      enum: ["CURRENT_ONLY", "CURRENT_AND_PAST"],
      default: "CURRENT_ONLY",
    },
    selectionCriteria: [{ type: String }],
    displayGroups: [displayGroupSchema],
  },
  { timestamps: true }
);

export const PimReport = model<PimReportDocument>(
  "PimReport",
  pimReportSchema
);
