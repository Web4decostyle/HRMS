import mongoose from "mongoose";
import { Response } from "express";
import { ApiError } from "../../utils/ApiError";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ChangeRequestModel } from "./changeRequest.model";

function requireAdmin(req: AuthRequest) {
  if (req.user?.role !== "ADMIN") throw ApiError.forbidden("Admin only");
}

function trimOrUndef(v: any) {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : undefined;
}

function sanitizePayload(modelName: string, payload: any) {
  const p = payload || {};

  // PIM models (just pass through; you can tighten later)
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

  return p;
}

async function ensureNoDuplicateOnCreate(modelName: string, payload: any) {
  // name-unique masters
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

async function ensureNoDuplicateOnUpdate(modelName: string, targetId: string, payload: any) {
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

export async function approveChangeRequest(req: AuthRequest, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  const cr = await ChangeRequestModel.findById(id);
  if (!cr) throw ApiError.notFound("Change request not found");
  if (cr.status !== "PENDING") throw ApiError.badRequest("Request already processed");

  // ✅ whitelist models to avoid security issues
  const ALLOWED_MODELS = new Set([
    "EmergencyContact",
    "Dependent",
    "Education",
    "WorkExperience",
    "JobTitle",
    "PayGrade",
    "EmploymentStatus",
    "JobCategory",
  ]);

  if (!ALLOWED_MODELS.has(cr.modelName)) {
    throw ApiError.badRequest(`Model not allowed: ${cr.modelName}`);
  }

  const Model = mongoose.model(cr.modelName);

  // ✅ sanitize payload
  const payload = sanitizePayload(cr.modelName, cr.payload);

  let result: any = null;

  if (cr.action === "CREATE") {
    await ensureNoDuplicateOnCreate(cr.modelName, payload);
    result = await Model.create(payload);
  } else if (cr.action === "UPDATE") {
    if (!cr.targetId) throw ApiError.badRequest("targetId required for UPDATE");
    await ensureNoDuplicateOnUpdate(cr.modelName, cr.targetId, payload);
    result = await Model.findByIdAndUpdate(cr.targetId, payload, { new: true });
  } else if (cr.action === "DELETE") {
    if (!cr.targetId) throw ApiError.badRequest("targetId required for DELETE");
    result = await Model.findByIdAndDelete(cr.targetId);
  }

  cr.status = "APPROVED";
  cr.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
  cr.reviewedAt = new Date();
  await cr.save();

  res.json({ ok: true, approved: true, appliedResult: result });
}

export async function rejectChangeRequest(req: AuthRequest, res: Response) {
  requireAdmin(req);

  const { id } = req.params;
  const { decisionReason } = req.body || {};

  const cr = await ChangeRequestModel.findById(id);
  if (!cr) throw ApiError.notFound("Change request not found");
  if (cr.status !== "PENDING") throw ApiError.badRequest("Request already processed");

  cr.status = "REJECTED";
  cr.decisionReason = decisionReason || "";
  cr.reviewedBy = new mongoose.Types.ObjectId(req.user!.id);
  cr.reviewedAt = new Date();
  await cr.save();

  res.json({ ok: true, approved: false });
}
