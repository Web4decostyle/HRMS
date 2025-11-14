// backend/src/modules/performance/performance.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPerformanceReview extends Document {
  employee: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId; // Employee or User
  periodStart: Date;
  periodEnd: Date;
  rating: number; // 1–5
  comments?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED";
}

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comments: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

export const PerformanceReview = mongoose.model<IPerformanceReview>(
  "PerformanceReview",
  PerformanceReviewSchema
);
