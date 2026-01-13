import type { AuthRequest } from "../../middleware/authMiddleware";
import { AuditAction, AuditLogModel } from "./audit.model";
import mongoose from "mongoose";

type CreateAuditArgs = {
  req: AuthRequest;
  action: AuditAction;
  module: string;
  modelName: string;
  actionType: "CREATE" | "UPDATE" | "DELETE";
  targetId?: string | null;
  changeRequestId?: string | null;
  before?: any;
  after?: any;
  appliedResult?: any;
  approvedAt?: Date;
  approvedBy?: string | null;
  decisionReason?: string;
  meta?: Record<string, any>;
};

function getIp(req: AuthRequest) {
  const xf = (req.headers["x-forwarded-for"] || "").toString();
  if (xf) return xf.split(",")[0].trim();
  return (req.ip || "").toString();
}

async function lookupUserBrief(userId?: string | null) {
  if (!userId) return null;
  try {
    // ✅ IMPORTANT: uses already-registered User model
    const User = mongoose.model("User");
    const u: any = await User.findById(userId).select("username firstName lastName name fullName employeeName role").lean();
    if (!u) return null;

    const username = u.username || "";
    const name =
      [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
      u.fullName ||
      u.employeeName ||
      u.name ||
      username ||
      "";

    return { username, name };
  } catch {
    return null;
  }
}

export async function createAuditLog(args: CreateAuditArgs) {
  try {
    const u = args.req.user;
    if (!u?.id) return;

    // actor (current logged in admin)
    const actorBrief = await lookupUserBrief(u.id);

    // approvedBy (admin id)
    const approvedBrief = await lookupUserBrief(args.approvedBy || u.id);

    // requester comes from meta (we set meta.requestedBy in change request controller)
    const requesterId = args.meta?.requestedBy || args.meta?.requestedById || null;
    const requesterBrief = await lookupUserBrief(requesterId);

    await AuditLogModel.create({
      action: args.action,

      actorId: u.id,
      actorRole: u.role,

      actorUsername: actorBrief?.username || u.username || "",
      actorName: actorBrief?.name || "",

      module: args.module,
      modelName: args.modelName,
      actionType: args.actionType,
      targetId: args.targetId || undefined,

      changeRequestId: args.changeRequestId || undefined,

      before: args.before ?? null,
      after: args.after ?? null,
      appliedResult: args.appliedResult ?? null,

      approvedAt: args.approvedAt,
      approvedBy: args.approvedBy || undefined,

      approvedByUsername: approvedBrief?.username || "",
      approvedByName: approvedBrief?.name || "",

      decisionReason: args.decisionReason || "",

      ip: getIp(args.req),
      userAgent: (args.req.headers["user-agent"] || "").toString(),

      meta: {
        ...(args.meta || {}),
        // ✅ NEW: store requester username for frontend
        requestedByUsername: requesterBrief?.username || "",
        requestedByName: requesterBrief?.name || "",
      },
    });
  } catch {
    // never break main flow
  }
}
