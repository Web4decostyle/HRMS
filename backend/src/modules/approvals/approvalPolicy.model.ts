import mongoose, { Schema } from "mongoose";

const ApprovalStepSchema = new Schema(
  {
    order: { type: Number, required: true },
    role: {
      type: String,
      enum: ["SUPERVISOR", "HR", "ADMIN"],
      required: true,
    },
  },
  { _id: false }
);

const ApprovalPolicySchema = new Schema(
  {
    module: { type: String, required: true },     
    entityType: { type: String, required: true }, 
    steps: { type: [ApprovalStepSchema], required: true },
  },
  { timestamps: true }
);

export const ApprovalPolicy = mongoose.model(
  "ApprovalPolicy",
  ApprovalPolicySchema
);
