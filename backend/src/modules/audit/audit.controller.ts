import type { Request, Response } from "express";
import { AuditLogModel } from "./audit.model";

export async function getAuditHistory(req: Request, res: Response) {
  const {
    module,
    modelName,
    action,
    actionType,
    q,
    limit,
    page,
  } = req.query as Record<string, string>;

  const filter: any = {};

  if (module) filter.module = module;
  if (modelName) filter.modelName = modelName;
  if (action) filter.action = action;
  if (actionType) filter.actionType = actionType;

  // quick text search
  if (q) {
    const rx = new RegExp(q, "i");
    filter.$or = [
      { module: rx },
      { modelName: rx },
      { action: rx },
      { actionType: rx },
      { targetId: rx },
      { decisionReason: rx },
      { ip: rx },
      { userAgent: rx },
    ];
  }

  const lim = Math.min(Number(limit || 200), 1000);
  const pg = Math.max(Number(page || 1), 1);
  const skip = (pg - 1) * lim;

  const [items, total] = await Promise.all([
    AuditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(lim)
      .lean(),
    AuditLogModel.countDocuments(filter),
  ]);

  res.json({ items, total, page: pg, limit: lim });
}
