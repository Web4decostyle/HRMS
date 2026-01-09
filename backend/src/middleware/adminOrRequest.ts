// backend/src/middleware/adminOrRequest.ts
import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./authMiddleware";
import { ChangeRequestModel } from "../modules/change-requests/changeRequest.model";
import { User } from "../modules/auth/auth.model";
import { createNotification } from "../modules/notifications/notification.service";

type BuildPayloadFn = (req: AuthRequest) => any;

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Only models we allow HR to request approval for
const ALLOWED_MODELS = new Set([
  "EmergencyContact",
  "Dependent",
  "Education",
  "WorkExperience",
  "JobTitle",
  "PayGrade",
  "EmploymentStatus",
  "JobCategory",
  "Employee",
]);

export function adminOrRequestChange(opts: {
  module: string;
  modelName: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  buildPayload?: BuildPayloadFn;
  getTargetId?: (req: AuthRequest) => string | undefined;
}) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role || "ESS";

    // Admin → allow controller to run
    if (role === "ADMIN") return next();

    // Block non-admin writes unless HR is requesting approval
    if (!READ_ONLY_METHODS.has(req.method) && role !== "HR") {
      return next(ApiError.forbidden("You don't have permission to change this"));
    }

    // HR → create change request instead of applying changes
    if (role === "HR") {
      if (!ALLOWED_MODELS.has(opts.modelName)) {
        return next(
          ApiError.badRequest(`Model not allowed for approval: ${opts.modelName}`)
        );
      }

      const reason =
        (req.body?.reason || req.headers["x-change-reason"] || "").toString();

      const payload = opts.buildPayload ? opts.buildPayload(req) : req.body;
      const targetId = opts.getTargetId ? opts.getTargetId(req) : undefined;

      // capture BEFORE snapshot for UPDATE/DELETE
      let before: any = null;
      if ((opts.action === "UPDATE" || opts.action === "DELETE") && targetId) {
        try {
          const Model = mongoose.model(opts.modelName);
          before = await Model.findById(targetId).lean();
        } catch {
          before = null;
        }
      }

      const cr = await ChangeRequestModel.create({
        module: opts.module,
        modelName: opts.modelName,
        action: opts.action,
        targetId,
        payload,
        after: payload,
        before,
        reason,
        requestedBy: new mongoose.Types.ObjectId(req.user!.id),
        requestedByRole: role,
      });

      // Notify all ADMIN users
      const admins = await User.find({ role: "ADMIN", isActive: true })
        .select("_id")
        .lean();

      await Promise.all(
        admins.map((a) =>
          createNotification({
            userId: String(a._id),
            title: "New approval request",
            message: `${opts.module} • ${opts.modelName} • ${opts.action}`,
            type: "APPROVAL",
            link: "/admin/approvals",
            meta: {
              changeRequestId: String(cr._id),
              module: opts.module,
              modelName: opts.modelName,
              action: opts.action,
            },
          })
        )
      );

      return res.status(202).json({
        ok: true,
        message: "Submitted for admin approval",
        changeRequestId: cr._id,
      });
    }

    return next();
  };
}
