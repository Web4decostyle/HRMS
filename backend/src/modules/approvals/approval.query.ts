import { ApprovalRequest } from "./approvalRequest.model";
import { ApprovalPolicy } from "./approvalPolicy.model";

export async function getPendingApprovalsForUser(user: Express.User) {
  const policies = await ApprovalPolicy.find({
    "steps.role": user.role,
  }).lean();

  const allowedSteps = policies.flatMap((p) =>
    p.steps
      .filter((s) => s.role === user.role)
      .map((s) => ({
        module: p.module,
        entityType: p.entityType,
        order: s.order,
      }))
  );

  if (!allowedSteps.length) return [];

  return ApprovalRequest.find({
    status: "PENDING",
    $or: allowedSteps.map((s) => ({
      module: s.module,
      entityType: s.entityType,
      currentStep: s.order,
    })),
  })
    .populate("requestedBy", "firstName lastName employeeId")
    .sort({ createdAt: -1 })
    .lean();
}
