import mongoose, { Schema, InferSchemaType } from "mongoose";

export type ChangeRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ChangeAction = "CREATE" | "UPDATE" | "DELETE";

const changeRequestSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    module: { type: String, required: true, index: true }, // e.g. "PIM"
    modelName: { type: String, required: true }, // e.g. "EmergencyContact"
    action: { type: String, enum: ["CREATE", "UPDATE", "DELETE"], required: true },

    // UPDATE/DELETE target
    targetId: { type: String },

    // CREATE/UPDATE payload
    payload: { type: Schema.Types.Mixed, default: {} },

    reason: { type: String, default: "" },

    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    requestedByRole: { type: String, required: true },

    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    decisionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

export type ChangeRequest = InferSchemaType<typeof changeRequestSchema>;

export const ChangeRequestModel =
  mongoose.models.ChangeRequest ||
  mongoose.model("ChangeRequest", changeRequestSchema);
