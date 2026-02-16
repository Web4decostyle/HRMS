import { Schema, model, Types, Document } from "mongoose";

export type VacancyStatus = "OPEN" | "CLOSED";

export interface VacancyDoc extends Document {
  name: string;
  job: Types.ObjectId;

  // ✅ Hiring Manager reference (Employee) + display + email
  hiringManagerEmployeeId?: Types.ObjectId;
  hiringManagerName?: string;
  hiringManagerEmail?: string;

  status: VacancyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<VacancyDoc>(
  {
    name: { type: String, required: true, trim: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },

    // ✅ NEW
    hiringManagerEmployeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
    hiringManagerName: { type: String, trim: true },
    hiringManagerEmail: { type: String, trim: true, lowercase: true },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export const Vacancy = model<VacancyDoc>("Vacancy", vacancySchema);
