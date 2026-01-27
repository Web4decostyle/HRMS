import mongoose, { Document, Schema } from "mongoose";

export type CandidateStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "HIred"
  | "REJECTED";

export interface ICandidate extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  vacancy?: mongoose.Types.ObjectId;
  email: string;
  contactNumber?: string;
  keywords?: string[];
  dateOfApplication: Date;
  notes?: string;
  consentToKeepData: boolean;
  status: CandidateStatus;
  resume?: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema(
  {
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
  },
  { _id: false }
);

const CandidateSchema = new Schema<ICandidate>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    vacancy: { type: Schema.Types.ObjectId, ref: "Vacancy" },
    email: { type: String, required: true, trim: true },
    contactNumber: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
    dateOfApplication: { type: Date, required: true },
    notes: { type: String, trim: true },
    consentToKeepData: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "HIred", "REJECTED"],
      default: "APPLIED",
    },
    resume: ResumeSchema,
  },
  { timestamps: true }
);

export const Candidate =
  mongoose.models.Candidate || mongoose.model<ICandidate>("Candidate", CandidateSchema);
