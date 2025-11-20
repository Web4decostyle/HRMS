import mongoose, { Schema, Document } from "mongoose";

export interface ITax extends Document {
  employeeId: mongoose.Types.ObjectId;

  // Federal
  federalStatus?: string;
  federalExemptions?: number;

  // State
  state?: string;
  stateStatus?: string;
  stateExemptions?: number;

  // Additional
  unemploymentState?: string;
  workState?: string;
}

const TaxSchema = new Schema<ITax>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      unique: true,
      index: true,
    },

    federalStatus: String,
    federalExemptions: Number,

    state: String,
    stateStatus: String,
    stateExemptions: Number,

    unemploymentState: String,
    workState: String,
  },
  { timestamps: true }
);

export const Tax = mongoose.model<ITax>("Tax", TaxSchema);
