// backend/src/modules/recruitment/candidate.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type CandidateStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED";

export interface ICandidate extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  job: mongoose.Types.ObjectId;
  status: CandidateStatus;
  resumeUrl?: string;
  notes?: string;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"],
      default: "APPLIED",
    },
    resumeUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Candidate = mongoose.model<ICandidate>(
  "Candidate",
  CandidateSchema
);
