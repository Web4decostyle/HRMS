import mongoose, { Schema, Document } from "mongoose";

export interface IPimOptionalFields extends Document {
  showNickname: boolean;
  showSmoker: boolean;
  showMilitaryService: boolean;

  showSSN: boolean;
  showSIN: boolean;
  showUSTaxExemptions: boolean;
}

const PimOptionalFieldsSchema = new Schema<IPimOptionalFields>(
  {
    showNickname: { type: Boolean, default: true },
    showSmoker: { type: Boolean, default: true },
    showMilitaryService: { type: Boolean, default: true },

    showSSN: { type: Boolean, default: false },
    showSIN: { type: Boolean, default: false },
    showUSTaxExemptions: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PimOptionalFields = mongoose.model<IPimOptionalFields>(
  "PimOptionalFields",
  PimOptionalFieldsSchema
);
