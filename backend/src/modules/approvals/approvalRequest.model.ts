import mongoose, { Schema } from "mongoose";
import { ApprovalStatus } from "./approval.types";

const ApprovalRequestSchema = new Schema(
  {
    module: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    payload: { type: Schema.Types.Mixed, required: true },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentStep: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const ApprovalRequest = mongoose.model(
  "ApprovalRequest",
  ApprovalRequestSchema
);
