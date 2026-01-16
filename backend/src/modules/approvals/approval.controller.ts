import { Request, Response } from "express";
import { createApprovalRequest, actOnApproval } from "./approval.service";
import { ApiError } from "../../utils/ApiError";

export async function requestApproval(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized("Missing auth user");

  const result = await createApprovalRequest({
    module: req.body.module,
    entityType: req.body.entityType,
    entityId: req.body.entityId,
    payload: req.body.payload,
    userId: req.user.id,
  });

  res.status(201).json(result);
}

export async function approveReject(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized("Missing auth user");

  const result = await actOnApproval({
    approvalId: req.params.id,
    action: req.body.action,
    remarks: req.body.remarks,
    user: req.user, // ✅ now matches Express.User
  });

  res.json(result);
}
