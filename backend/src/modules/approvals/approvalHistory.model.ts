import mongoose, { Schema } from "mongoose";

const ApprovalHistorySchema = new Schema(
  {
    approvalRequestId: {
      type: Schema.Types.ObjectId,
      ref: "ApprovalRequest",
      required: true,
    },
    action: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      required: true,
    },
    actionBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: { type: String, required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

export const ApprovalHistory = mongoose.model(
  "ApprovalHistory",
  ApprovalHistorySchema
);
