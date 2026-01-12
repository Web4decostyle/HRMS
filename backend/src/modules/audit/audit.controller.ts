import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { AuditLogModel } from "./audit.model";

export async function listAuditLogs(req: AuthRequest, res: Response) {
  const {
    module,
    modelName,
    actorId,
    action,
    actionType,
    from,
    to,
    page = "1",
    limit = "50",
  } = (req.query || {}) as Record<string, string>;

  const q: any = {};
  if (module) q.module = module;
  if (modelName) q.modelName = modelName;
  if (actorId) q.actorId = actorId;
  if (action) q.action = action;
  if (actionType) q.actionType = actionType;

  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (p - 1) * l;

  const [items, total] = await Promise.all([
    AuditLogModel.find(q).sort({ createdAt: -1 }).skip(skip).limit(l).lean(),
    AuditLogModel.countDocuments(q),
  ]);

  res.json({ items, total, page: p, limit: l });
}
