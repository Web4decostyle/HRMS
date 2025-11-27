import { Schema, model, Document } from "mongoose";

export interface TerminationReasonDocument extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const terminationReasonSchema = new Schema<TerminationReasonDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 200,
    },
  },
  { timestamps: true }
);

export const TerminationReason = model<TerminationReasonDocument>(
  "TerminationReason",
  terminationReasonSchema
);
