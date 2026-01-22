// backend/src/modules/leave/leave.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface ILeaveType extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

export type LeaveHistoryAction = "CREATED" | "APPROVED" | "REJECTED" | "CANCELLED" | "ASSIGNED";

export interface ILeaveHistoryItem {
  action: LeaveHistoryAction;
  byUser: mongoose.Types.ObjectId; // User _id
  byRole: string;
  at: Date;
  remarks?: string;
}

export interface ILeaveApproval {
  supervisorEmployee?: mongoose.Types.ObjectId; // Employee _id (assigned supervisor)
  supervisorAction?: "PENDING" | "APPROVED" | "REJECTED";
  supervisorActedBy?: mongoose.Types.ObjectId; // User _id (supervisor user)
  supervisorActedAt?: Date;
  supervisorRemarks?: string;

  // ✅ NEW: Admin can also approve/reject. Only ONE approval is required (Supervisor OR Admin).
  adminAction?: "PENDING" | "APPROVED" | "REJECTED";
  adminActedBy?: mongoose.Types.ObjectId; // User _id (admin user)
  adminActedAt?: Date;
  adminRemarks?: string;
}

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId; // Employee _id
  type: mongoose.Types.ObjectId; // LeaveType _id
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  days: number;
  approval?: ILeaveApproval;
  history: ILeaveHistoryItem[];
}

const LeaveTypeSchema = new Schema<ILeaveType>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const LeaveHistorySchema = new Schema<ILeaveHistoryItem>(
  {
    action: { type: String, required: true },
    byUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    byRole: { type: String, required: true },
    at: { type: Date, required: true },
    remarks: { type: String },
  },
  { _id: false }
);

const LeaveApprovalSchema = new Schema<ILeaveApproval>(
  {
    supervisorEmployee: { type: Schema.Types.ObjectId, ref: "Employee" },
    supervisorAction: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    supervisorActedBy: { type: Schema.Types.ObjectId, ref: "User" },
    supervisorActedAt: { type: Date },
    supervisorRemarks: { type: String },

    // ✅ Admin decision tracking
    adminAction: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
    adminActedBy: { type: Schema.Types.ObjectId, ref: "User" },
    adminActedAt: { type: Date },
    adminRemarks: { type: String },
  },
  { _id: false }
);

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
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
    approval: { type: LeaveApprovalSchema, default: undefined },
    history: { type: [LeaveHistorySchema], default: [] },
  },
  { timestamps: true }
);

export const LeaveType = mongoose.model<ILeaveType>("LeaveType", LeaveTypeSchema);
export const LeaveRequest = mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
