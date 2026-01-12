import mongoose from "mongoose";
import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { ChangeRequestModel } from "../modules/change-requests/changeRequest.model";
import { createAuditLog } from "../modules/audit/audit.service";
import { ApiError } from "../utils/ApiError";

const READ_ONLY = new Set(["GET", "HEAD", "OPTIONS"]);

export async function autoApprovalGate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (READ_ONLY.has(req.method)) return next();

  const role = req.user?.role;
  if (!role) throw ApiError.unauthorized("Unauthorized");

  // Admin can directly modify
  if (role === "ADMIN") return next();

  // Prevent double-handling
  res.locals.__approvalHandled = true;

  const modelName =
    (req.headers["x-model-name"] as string) || "__MANUAL__";
  const module =
    (req.headers["x-module-name"] as string) || "UNKNOWN";

  const targetId =
    req.params.id ||
    req.body?.id ||
    req.body?._id ||
    undefined;

  let before: any = null;
  if (targetId && modelName !== "__MANUAL__") {
    try {
      const Model = mongoose.model(modelName);
      before = await Model.findById(targetId).lean();
    } catch {
      before = null;
    }
  }

  const cr = await ChangeRequestModel.create({
    module,
    modelName,
    action:
      req.method === "POST"
        ? "CREATE"
        : req.method === "DELETE"
        ? "DELETE"
        : "UPDATE",
    targetId,
    payload: req.body,
    before,
    after: req.body,
    requestedBy: req.user!.id,
    requestedByRole: role,
    reason:
      (req.headers["x-change-reason"] as string) ||
      req.body?.reason ||
      "",
  });

  // AUDIT LOG — REQUEST CREATED
  await createAuditLog({
    req,
    action: "CHANGE_REQUEST_CREATED",
    module,
    modelName,
    actionType: cr.action,
    targetId,
    changeRequestId: String(cr._id),
    before,
    after: req.body,
    meta: {
      url: req.originalUrl,
      method: req.method,
    },
  });

  return res.status(202).json({
    ok: true,
    message: "Request submitted for admin approval",
    changeRequestId: cr._id,
  });
}
