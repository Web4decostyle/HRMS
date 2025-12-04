// backend/src/modules/performance/performance.models.ts
import { Schema, model, Types, Document } from "mongoose";

/* ================================
   KPI (Configure → KPIs)
================================ */

export interface PerformanceKpiDocument extends Document {
  jobTitle: string;          // snapshot of job title
  kpiTitle: string;          // "Achieves sales targets"
  minRate: number;           // 1..5
  maxRate: number;           // 1..5
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceKpiSchema = new Schema<PerformanceKpiDocument>(
  {
    jobTitle: { type: String, required: true, index: true },
    kpiTitle: { type: String, required: true, trim: true },
    minRate: { type: Number, required: true, min: 0 },
    maxRate: { type: Number, required: true, min: 0 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PerformanceKpi = model<PerformanceKpiDocument>(
  "PerformanceKpi",
  PerformanceKpiSchema
);

/* ================================
   Tracker (Configure → Trackers)
   A tracker groups employee + reviewers
================================ */

export interface PerformanceTrackerDocument extends Document {
  name: string;                    // "Sales Tracker"
  employee: Types.ObjectId;        // employee being tracked
  reviewers: Types.ObjectId[];     // managers / peers
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceTrackerSchema = new Schema<PerformanceTrackerDocument>(
  {
    name: { type: String, required: true, trim: true },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    reviewers: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const PerformanceTracker = model<PerformanceTrackerDocument>(
  "PerformanceTracker",
  PerformanceTrackerSchema
);

/* ================================
   Review (Manage Reviews dropdown)
================================ */

export type ReviewStatus =
  | "NOT_STARTED"
  | "ACTIVATED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ARCHIVED";

export interface ReviewKpiRating {
  kpi: Types.ObjectId;      // ref PerformanceKpi
  rating?: number;          // 1..5
  comment?: string;
}

export interface PerformanceReviewDocument extends Document {
  employee: Types.ObjectId;        // employee being reviewed
  reviewer: Types.ObjectId;        // main reviewer
  additionalReviewers: Types.ObjectId[];

  jobTitle: string;
  subUnit?: string;                // department / sub unit

  periodFrom: Date;
  periodTo: Date;
  dueDate: Date;

  status: ReviewStatus;
  overallRating?: number;

  kpiRatings: ReviewKpiRating[];

  createdAt: Date;
  updatedAt: Date;
}

const ReviewKpiRatingSchema = new Schema<ReviewKpiRating>(
  {
    kpi: { type: Schema.Types.ObjectId, ref: "PerformanceKpi", required: true },
    rating: { type: Number, min: 0, max: 5 },
    comment: { type: String, trim: true },
  },
  { _id: false }
);

const PerformanceReviewSchema = new Schema<PerformanceReviewDocument>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    additionalReviewers: [
      { type: Schema.Types.ObjectId, ref: "Employee" },
    ],

    jobTitle: { type: String, required: true },
    subUnit: { type: String },

    periodFrom: { type: Date, required: true },
    periodTo: { type: Date, required: true },
    dueDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["NOT_STARTED", "ACTIVATED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"],
      default: "NOT_STARTED",
      index: true,
    },
    overallRating: { type: Number, min: 0, max: 5 },

    kpiRatings: [ReviewKpiRatingSchema],
  },
  { timestamps: true }
);

export const PerformanceReview = model<PerformanceReviewDocument>(
  "PerformanceReview",
  PerformanceReviewSchema
);
