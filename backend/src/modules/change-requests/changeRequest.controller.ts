// backend/src/modules/change-requests/changeRequest.controller.ts
import mongoose from "mongoose";
import { Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ChangeRequestModel } from "./changeRequest.model";
import { createNotification } from "../notifications/notification.service";
import { createAuditLog } from "../audit/audit.service";

function requireAdmin(req: AuthRequest) {
  if (req.user?.role !== "ADMIN") throw ApiError.forbidden("Admin only");
}

function trimOrUndef(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : undefined;
}

function sanitizePayload(modelName: string, payload: any) {
  const p = payload || {};

  // PIM models (pass-through; can tighten later)
  if (
    modelName === "EmergencyContact" ||
    modelName === "Dependent" ||
    modelName === "Education" ||
    modelName === "WorkExperience"
  ) {
    return p;
  }

  if (modelName === "JobTitle") {
    return {
      name: (p.name || "").toString().trim(),
      description: trimOrUndef(p.description),
      note: trimOrUndef(p.note),
      specFilePath: trimOrUndef(p.specFilePath),
    };
  }

  if (modelName === "PayGrade") {
    return {
      name: (p.name || "").toString().trim(),
      currency: trimOrUndef(p.currency),
      minSalary: p.minSalary ?? undefined,
      maxSalary: p.maxSalary ?? undefined,
    };
  }

  if (modelName === "EmploymentStatus") {
    return { name: (p.name || "").toString().trim() };
  }

  if (modelName === "JobCategory") {
    return { name: (p.name || "").toString().trim() };
  }

  // Employee + everything else: pass through
  return p;
}

async function ensureNoDuplicateOnCreate(modelName: string, payload: any) {
  if (
    modelName === "JobTitle" ||
    modelName === "PayGrade" ||
    modelName === "EmploymentStatus" ||
    modelName === "JobCategory"
  ) {
    const name = (payload?.name || "").toString().trim();
    if (!name) throw ApiError.badRequest("Name is required");

    const Model = mongoose.model(modelName);
    const exists = await Model.findOne({ name }).lean();
    if (exists) throw ApiError.conflict(`${modelName} already exists`);
  }
}

async function ensureNoDuplicateOnUpdate(
  modelName: string,
  targetId: string,
  payload: any
) {
  if (
    modelName === "JobTitle" ||
    modelName === "PayGrade" ||
    modelName === "EmploymentStatus" ||
    modelName === "JobCategory"
  ) {
    const name = (payload?.name || "").toString().trim();
    if (!name) throw ApiError.badRequest("Name is required");

    const Model = mongoose.model(modelName);
    const exists = await Model.findOne({ name, _id: { $ne: targetId } }).lean();
    if (exists) throw ApiError.conflict(`${modelName} name already exists`);
  }
}

// ✅ Whitelist models to avoid security issues
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

/* ========================= LISTING ========================= */

// HR/anyone can see their own requests
export async function listMyChangeRequests(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const items = await ChangeRequestModel.find({ requestedBy: userId })
    .sort({ createdAt: -1 })
    .lean();
  res.json(items);
}

// Admin can see all pending
export async function listPendingChangeRequests(req: AuthRequest, res: Response) {
  requireAdmin(req);
  const items = await ChangeRequestModel.find({ status: "PENDING" })
    .sort({ createdAt: -1 })
    .lean();
  res.json(items);
}

// ✅ NEW: Admin can see history of approved/rejected (audit log)
export async function listHistoryChangeRequests(req: AuthRequest, res: Response) {
  requireAdmin(req);
  const items = await ChangeRequestModel.find({
    status: { $in: ["APPROVED", "REJECTED"] },
  })
    .sort({ reviewedAt: -1, createdAt: -1 })
    .limit(500)
    .lean();

  res.json(items);
}

/* ========================= ACTIONS ========================= */

export async function approveChangeRequest(req: AuthRequest, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  const cr = await ChangeRequestModel.findById(id);
  if (!cr) throw ApiError.notFound("Change request not found");
  if (cr.status !== "PENDING")
    throw ApiError.badRequest("Request already processed");

  if (!ALLOWED_MODELS.has(cr.modelName)) {
    throw ApiError.badRequest(`Model not allowed: ${cr.modelName}`);
  }

  const Model = mongoose.model(cr.modelName);

  // sanitize payload
  const sanitized = sanitizePayload(cr.modelName, cr.payload);

  let result: any = null;

  if (cr.action === "CREATE") {
    await ensureNoDuplicateOnCreate(cr.modelName, sanitized);
    result = await Model.create(sanitized);
  } else if (cr.action === "UPDATE") {
    if (!cr.targetId)
      throw ApiError.badRequest("targetId required for UPDATE");
    await ensureNoDuplicateOnUpdate(cr.modelName, cr.targetId, sanitized);
    result = await Model.findByIdAndUpdate(cr.targetId, sanitized, { new: true });
  } else if (cr.action === "DELETE") {
    if (!cr.targetId)
      throw ApiError.badRequest("targetId required for DELETE");
    result = await Model.findByIdAndDelete(cr.targetId);
  } else {
    throw ApiError.badRequest("Invalid action");
  }

  cr.status = "APPROVED";
  cr.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
  cr.reviewedAt = new Date();

  // audit snapshots
  cr.after = sanitized;
  cr.appliedResult = result;

  await cr.save();

  // ✅ audit log: admin approved + applied
  void createAuditLog({
    req,
    action: "CHANGE_REQUEST_APPROVED",
    module: cr.module,
    modelName: cr.modelName,
    actionType: cr.action,
    targetId: cr.targetId || null,
    changeRequestId: String(cr._id),
    before: cr.before,
    after: cr.after,
    appliedResult: cr.appliedResult,
    approvedAt: cr.reviewedAt || new Date(),
    approvedBy: req.user?.id || null,
    decisionReason: cr.decisionReason || "",
    meta: { requestedBy: String(cr.requestedBy), requestedByRole: cr.requestedByRole },
  });

  // notify requester
  await createNotification({
    userId: String(cr.requestedBy),
    title: "Change request approved",
    message: `${cr.module} • ${cr.modelName} • ${cr.action} approved`,
    type: "SUCCESS",
    link: "/admin/approvals",
    meta: { changeRequestId: String(cr._id), status: "APPROVED" },
  });

  res.json({ ok: true, approved: true, appliedResult: result });
}

export async function rejectChangeRequest(req: AuthRequest, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  const { decisionReason } = req.body || {};

  const cr = await ChangeRequestModel.findById(id);
  if (!cr) throw ApiError.notFound("Change request not found");
  if (cr.status !== "PENDING")
    throw ApiError.badRequest("Request already processed");

  cr.status = "REJECTED";
  cr.decisionReason = decisionReason || "";
  cr.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
  cr.reviewedAt = new Date();
  await cr.save();

  // ✅ audit log: admin rejected
  void createAuditLog({
    req,
    action: "CHANGE_REQUEST_REJECTED",
    module: cr.module,
    modelName: cr.modelName,
    actionType: cr.action,
    targetId: cr.targetId || null,
    changeRequestId: String(cr._id),
    before: cr.before,
    after: cr.after,
    approvedAt: cr.reviewedAt || new Date(),
    approvedBy: req.user?.id || null,
    decisionReason: cr.decisionReason || "",
    meta: { requestedBy: String(cr.requestedBy), requestedByRole: cr.requestedByRole },
  });

  // notify requester
  await createNotification({
    userId: String(cr.requestedBy),
    title: "Change request rejected",
    message: `${cr.module} • ${cr.modelName} • ${cr.action} rejected`,
    type: "WARNING",
    link: "/admin/approvals",
    meta: { changeRequestId: String(cr._id), status: "REJECTED" },
  });

  res.json({ ok: true, approved: false });
}
