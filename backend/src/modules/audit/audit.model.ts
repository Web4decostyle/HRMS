import mongoose, { Schema, InferSchemaType } from "mongoose";

export type AuditAction =
  | "CHANGE_REQUEST_CREATED"
  | "CHANGE_REQUEST_APPROVED"
  | "CHANGE_REQUEST_REJECTED";

const auditLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },

    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorRole: { type: String, required: true, index: true },

    // ✅ NEW (for frontend display)
    actorUsername: { type: String, default: "", index: true },
    actorName: { type: String, default: "" },

    module: { type: String, required: true, index: true },
    modelName: { type: String, required: true, index: true },
    actionType: { type: String, required: true },
    targetId: { type: String },

    changeRequestId: { type: Schema.Types.ObjectId, ref: "ChangeRequest", index: true },

    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    appliedResult: { type: Schema.Types.Mixed, default: null },

    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },

    // ✅ NEW
    approvedByUsername: { type: String, default: "", index: true },
    approvedByName: { type: String, default: "" },

    decisionReason: { type: String, default: "" },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },

    // meta already exists; we’ll also store requester username here
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, modelName: 1, createdAt: -1 });

export type AuditLog = InferSchemaType<typeof auditLogSchema>;

export const AuditLogModel =
  (mongoose.models.AdminAuditLog as any) ||
  mongoose.model("AdminAuditLog", auditLogSchema);

