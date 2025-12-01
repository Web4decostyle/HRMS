import { Schema, model, Document } from "mongoose";

export interface IClaimEvent extends Document {
  name: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const ClaimEventSchema = new Schema<IClaimEvent>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

export const ClaimEvent = model<IClaimEvent>("ClaimEvent", ClaimEventSchema);
