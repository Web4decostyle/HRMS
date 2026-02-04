// backend/src/modules/divisions/subDivision.model.ts
import mongoose, { Schema } from "mongoose";

export type SubDivisionDoc = mongoose.Document & {
  division: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  description?: string;

  // ✅ TLs assigned to this sub-division
  tlEmployees: mongoose.Types.ObjectId[];

  isActive: boolean;
};

const subDivisionSchema = new Schema<SubDivisionDoc>(
  {
    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    description: { type: String, trim: true },

    // ✅ ADD THIS FIELD (this is the missing piece)
    tlEmployees: {
      type: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
      default: [],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique sub-division name within a division
subDivisionSchema.index({ division: 1, name: 1 }, { unique: true });
subDivisionSchema.index({ division: 1, code: 1 });

export const SubDivision = mongoose.model<SubDivisionDoc>(
  "SubDivision",
  subDivisionSchema
);
