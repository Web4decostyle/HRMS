import mongoose, { Schema } from "mongoose";

export type CandidateStatus =
  | "APPLIED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "HIRED"
  | "REJECTED";

export type CandidateDoc = mongoose.Document & {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  vacancy?: mongoose.Types.ObjectId | string;
  keywords?: string[] | string;
  notes?: string;
  consentToKeepData?: boolean;

  dateOfApplication?: Date;

  // ✅ new fields
  interviewDate?: Date;
  tempEmployeeCode?: string; // from interviewDate
  employeeCode?: string;     // final code after selection/hire

  status: CandidateStatus;
};

const CandidateSchema = new Schema<CandidateDoc>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: { type: String, required: true, trim: true, lowercase: true },
    contactNumber: { type: String, trim: true },

    vacancy: { type: Schema.Types.ObjectId, ref: "Vacancy" },

    // keep flexible since your frontend sends comma string sometimes
    keywords: { type: Schema.Types.Mixed },

    notes: { type: String },
    consentToKeepData: { type: Boolean, default: false },

    dateOfApplication: { type: Date, default: Date.now },

    // ✅ Interview + codes
    interviewDate: { type: Date },
    tempEmployeeCode: { type: String, index: true },
    employeeCode: { type: String, unique: true, sparse: true, index: true },

    status: {
      type: String,
      enum: ["APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "HIRED", "REJECTED"],
      default: "APPLIED",
      index: true,
    },
  },
  { timestamps: true }
);

export const Candidate =
  mongoose.models.Candidate || mongoose.model<CandidateDoc>("Candidate", CandidateSchema);
