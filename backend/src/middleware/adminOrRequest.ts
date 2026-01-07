import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./authMiddleware";
import { ChangeRequestModel } from "../modules/change-requests/changeRequest.model";

type BuildPayloadFn = (req: AuthRequest) => any;

export function adminOrRequestChange(opts: {
  module: string;
  modelName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  buildPayload?: BuildPayloadFn; // for CREATE/UPDATE
  getTargetId?: (req: AuthRequest) => string | undefined; // for UPDATE/DELETE
}) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role || "ESS";

    // ✅ Admin: allow real controller to run
    if (role === "ADMIN") return next();

    // ✅ HR: create change request (do NOT apply change)
    if (role === "HR") {
      const reason =
        (req.body?.reason ||
          req.headers["x-change-reason"] ||
          "").toString();

      const payload = opts.buildPayload ? opts.buildPayload(req) : req.body;
      const targetId = opts.getTargetId ? opts.getTargetId(req) : undefined;

      const cr = await ChangeRequestModel.create({
        module: opts.module,
        modelName: opts.modelName,
        action: opts.action,
        targetId,
        payload,
        reason,
        requestedBy: new mongoose.Types.ObjectId(req.user!.id),
        requestedByRole: role,
      });

      return res.status(202).json({
        ok: true,
        message: "Submitted for admin approval",
        changeRequestId: cr._id,
      });
    }

    // ✅ Supervisor / ESS / ESS_VIEWER / others → forbidden for writes
    return next(ApiError.forbidden("You don't have permission to change this"));
  };
}
