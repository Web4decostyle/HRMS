// backend/src/modules/divisions/division.model.ts
import mongoose, { Schema } from "mongoose";

export type DivisionDoc = mongoose.Document & {
  name: string;
  code?: string;
  description?: string;
  managerEmployee?: mongoose.Types.ObjectId | null;
  isActive: boolean;
};

const divisionSchema = new Schema<DivisionDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, trim: true },
    description: { type: String, trim: true },
    managerEmployee: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

divisionSchema.index({ name: 1 }, { unique: true });
divisionSchema.index({ code: 1 });

export const Division = mongoose.model<DivisionDoc>("Division", divisionSchema);
