// backend/src/modules/leave/leave.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface ILeaveType extends Document {
  name: string;
  code: string;
  isActive: boolean;
}

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason?: string;
  status: LeaveStatus;
  days: number;
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
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
