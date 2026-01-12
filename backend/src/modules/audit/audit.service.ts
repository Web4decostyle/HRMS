import type { AuthRequest } from "../../middleware/authMiddleware";
import { AuditAction, AuditLogModel } from "./audit.model";

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

export async function createAuditLog(args: CreateAuditArgs) {
  try {
    const u = args.req.user;
    if (!u?.id) return;

    await AuditLogModel.create({
      action: args.action,

      actorId: u.id,
      actorRole: u.role,

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
      decisionReason: args.decisionReason || "",

      ip: getIp(args.req),
      userAgent: (args.req.headers["user-agent"] || "").toString(),
      meta: args.meta || {},
    });
  } catch {
    // never break main flow
  }
}
