// backend/src/modules/leave/leave.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type LeaveApprovalAction = "PENDING" | "APPROVED" | "REJECTED";

export interface ILeaveType extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

export interface ILeaveRequest extends Document {
  /** Employee record (NOT auth user) */
  employee: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  days: number;

  /**
   * Multi-step approval
   * step=1 => waiting supervisor
   * step=2 => waiting HR
   * step=3 => completed (APPROVED/REJECTED/CANCELLED)
   */
  approval: {
    step: number;
    supervisorEmployee?: mongoose.Types.ObjectId;
    supervisorAction: LeaveApprovalAction;
    supervisorActedBy?: mongoose.Types.ObjectId;
    supervisorActedAt?: Date;
    supervisorRemarks?: string;
    hrAction: LeaveApprovalAction;
    hrActedBy?: mongoose.Types.ObjectId;
    hrActedAt?: Date;
    hrRemarks?: string;
  };
}

const LeaveTypeSchema = new Schema<ILeaveType>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    // IMPORTANT: keep this consistent with LeaveEntitlement (Employee ref)
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: Schema.Types.ObjectId, ref: "LeaveType", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: String,
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
    },
    days: { type: Number, default: 0 },

    approval: {
      step: { type: Number, default: 1 },

      supervisorEmployee: { type: Schema.Types.ObjectId, ref: "Employee" },
      supervisorAction: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
      },
      supervisorActedBy: { type: Schema.Types.ObjectId, ref: "User" },
      supervisorActedAt: { type: Date },
      supervisorRemarks: { type: String },

      hrAction: {
        type: String,
        enum: ["PENDING", "APPROVED", "REJECTED"],
        default: "PENDING",
      },
      hrActedBy: { type: Schema.Types.ObjectId, ref: "User" },
      hrActedAt: { type: Date },
      hrRemarks: { type: String },
    },
  },
  { timestamps: true }
);

export const LeaveType = mongoose.model<ILeaveType>(
  "LeaveType",
  LeaveTypeSchema
);

export const LeaveRequest = mongoose.model<ILeaveRequest>(
  "LeaveRequest",
  LeaveRequestSchema
);
