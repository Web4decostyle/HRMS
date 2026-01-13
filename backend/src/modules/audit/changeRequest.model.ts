import mongoose, { Schema } from "mongoose";

const ChangeRequestSchema = new Schema(
  {
    module: String,
    entity: String,
    entityId: String,

    requestedBy: {
      userId: String,
      role: String,
      name: String,
    },

    before: Schema.Types.Mixed,
    after: Schema.Types.Mixed,

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const ChangeRequest =
  mongoose.models.ChangeRequest || mongoose.model("ChangeRequest", ChangeRequestSchema);
