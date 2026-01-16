import mongoose from "mongoose";
import { ApprovalPolicy } from "./approvalPolicy.model";
import { ApprovalRequest } from "./approvalRequest.model";
import { ApprovalHistory } from "./approvalHistory.model";

/**
 * Called by ANY module instead of direct DB update
 */
export async function createApprovalRequest({
  module,
  entityType,
  entityId,
  payload,
  userId,
}: {
  module: string;
  entityType: string;
  entityId?: string;
  payload: any;
  userId: string;
}) {
  const policy = await ApprovalPolicy.findOne({ module, entityType });
  if (!policy) {
    throw new Error("Approval policy not configured");
  }

  return ApprovalRequest.create({
    module,
    entityType,
    entityId,
    payload,
    requestedBy: new mongoose.Types.ObjectId(userId), // ✅ convert here
    currentStep: 1,
  });
}

export async function actOnApproval({
  approvalId,
  action,
  remarks,
  user,
}: {
  approvalId: string;
  action: "APPROVED" | "REJECTED";
  remarks?: string;
  user: Express.User & { id: string };
}) {
  const req = await ApprovalRequest.findById(approvalId);
  if (!req || req.status !== "PENDING") {
    throw new Error("Invalid approval request");
  }

  const policy = await ApprovalPolicy.findOne({
    module: req.module,
    entityType: req.entityType,
  });

  const step = policy?.steps.find((s) => s.order === req.currentStep);
  if (!step || step.role !== user.role) {
    throw new Error("Not authorized for this approval step");
  }

  await ApprovalHistory.create({
    approvalRequestId: req._id, // ✅ Mongo doc → has _id
    action,
    actionBy: new mongoose.Types.ObjectId(user.id), // ✅ FIXED
    role: user.role,
    remarks,
  });

  if (action === "REJECTED") {
    req.status = "REJECTED";
    await req.save();
    return req;
  }

  // Move to next step or finalize
  if (req.currentStep >= policy!.steps.length) {
    req.status = "APPROVED";
    await req.save();

    // 🔥 APPLY HOOK (next step)
    return req;
  }

  req.currentStep += 1;
  await req.save();
  return req;
}