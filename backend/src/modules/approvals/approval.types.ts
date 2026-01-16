export type ApprovalModule =
  | "PIM"
  | "LEAVE"
  | "TIME"
  | "CLAIM"
  | "RECRUITMENT"
  | "PERFORMANCE";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type ApprovalRole = "SUPERVISOR" | "HR" | "ADMIN";

export interface ApprovalStepConfig {
  order: number;
  role: ApprovalRole;
}
