import { Schema, model, Types, Document } from "mongoose";

export type VacancyStatus = "OPEN" | "CLOSED";

export interface VacancyDoc extends Document {
  name: string;
  job: Types.ObjectId;
  hiringManagerName?: string;
  status: VacancyStatus;
  createdAt: Date;
  updatedAt: Date;
}

const vacancySchema = new Schema<VacancyDoc>(
  {
    name: { type: String, required: true, trim: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    hiringManagerName: { type: String, trim: true },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

export const Vacancy = model<VacancyDoc>("Vacancy", vacancySchema);
