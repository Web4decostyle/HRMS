// backend/src/modules/claim/claim.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IClaimType extends Document {
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface IClaimRequest extends Document {
  employee: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  claimDate: Date;
  description?: string;
  status: ClaimStatus;
}

const ClaimTypeSchema = new Schema<IClaimType>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ClaimType = mongoose.model<IClaimType>(
  "ClaimType",
  ClaimTypeSchema
);

const ClaimRequestSchema = new Schema<IClaimRequest>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: Schema.Types.ObjectId, ref: "ClaimType", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    claimDate: { type: Date, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export const ClaimRequest = mongoose.model<IClaimRequest>(
  "ClaimRequest",
  ClaimRequestSchema
);
