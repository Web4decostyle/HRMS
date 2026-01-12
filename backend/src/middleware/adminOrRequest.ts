// backend/src/middleware/adminOrRequest.ts
import mongoose from "mongoose";
import { Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./authMiddleware";
import { ChangeRequestModel } from "../modules/change-requests/changeRequest.model";
import { User } from "../modules/auth/auth.model";
import { createNotification } from "../modules/notifications/notification.service";
import { createAuditLog } from "../modules/audit/audit.service";

type BuildPayloadFn = (req: AuthRequest) => any;

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * ✅ Allow all registered models (best for “all edits must go to admin first”)
 * If you want to restrict later, you can shrink this set.
 */
const ALLOWED_MODELS = new Set<string>([
  "Attendance",
  "AttendanceSession",
  "BuzzPost",
  "Candidate",
  "ClaimRequest",
  "ClaimType",
  "CustomField",
  "Dependent",
  "Education",
  "EducationLevel",
  "EmailConfig",
  "EmergencyContact",
  "Employee",
  "EmploymentStatus",
  "Language",
  "LeaveRequest",
  "LeaveType",
  "License",
  "Nationality",
  "OrgUnit",
  "PayGrade",
  "PimImportHistory",
  "PimOptionalFields",
  "ReportingMethod",
  "Salary",
  "Skill",
  "Subordinate",
  "Supervisor",
  "SystemUser",
  "Tax",
  "Timesheet",
  "User",
  "WorkExperience",
  "WorkShift",
  "JobTitle",
  "JobCategory",
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

    // Always allow reads
    if (READ_ONLY_METHODS.has(req.method)) return next();

    // Admin → allow real controller
    if (role === "ADMIN") return next();

    // Mark handled so enforceAdminWrites doesn't block this request
    res.locals.__approvalHandled = true;

    if (!ALLOWED_MODELS.has(opts.modelName)) {
      return next(
        ApiError.badRequest(`Model not allowed for approval: ${opts.modelName}`)
      );
    }

    const reason =
      (req.body?.reason || req.headers["x-change-reason"] || "").toString();

    const payload = opts.buildPayload ? opts.buildPayload(req) : req.body;
    const targetId = opts.getTargetId ? opts.getTargetId(req) : undefined;

    // BEFORE snapshot for UPDATE/DELETE
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

    // ✅ Audit: request raised
    void createAuditLog({
      req,
      action: "CHANGE_REQUEST_CREATED",
      module: opts.module,
      modelName: opts.modelName,
      actionType: opts.action,
      targetId: targetId || null,
      changeRequestId: String(cr._id),
      before,
      after: payload,
      meta: { reason },
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
  };
}
