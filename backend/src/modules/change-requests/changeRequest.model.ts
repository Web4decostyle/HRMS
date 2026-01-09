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
    modelName: { type: String, required: true }, // e.g. "Employee"
    action: { type: String, enum: ["CREATE", "UPDATE", "DELETE"], required: true },

    // UPDATE/DELETE target
    targetId: { type: String },

    // ✅ NEW: snapshot BEFORE change (for UPDATE/DELETE)
    before: { type: Schema.Types.Mixed, default: null },

    // CREATE/UPDATE payload
    payload: { type: Schema.Types.Mixed, default: {} },

    // ✅ NEW: sanitized "after" snapshot (what will be applied)
    after: { type: Schema.Types.Mixed, default: {} },

    // ✅ NEW: applied result snapshot (after admin approves & DB updated)
    appliedResult: { type: Schema.Types.Mixed, default: null },

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
