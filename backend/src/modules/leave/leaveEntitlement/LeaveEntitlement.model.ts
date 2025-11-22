import { Schema, model, Document, Types } from "mongoose";

export interface ILeaveEntitlement extends Document {
  employee: Types.ObjectId;
  leaveType: Types.ObjectId;
  periodStart: Date;
  periodEnd: Date;
  days: number;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveEntitlementSchema = new Schema<ILeaveEntitlement>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee", 
      required: true,
    },
    leaveType: {
      type: Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    days: { type: Number, required: true },
  },
  { timestamps: true }
);

export const LeaveEntitlement = model<ILeaveEntitlement>(
  "LeaveEntitlement",
  LeaveEntitlementSchema
);
