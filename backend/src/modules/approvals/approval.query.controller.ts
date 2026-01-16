import { Request, Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { getPendingApprovalsForUser } from "./approval.query";

export async function myPendingApprovals(req: Request, res: Response) {
  if (!req.user) throw ApiError.unauthorized("Missing auth user");

  const approvals = await getPendingApprovalsForUser(req.user);
  res.json(approvals);
}
