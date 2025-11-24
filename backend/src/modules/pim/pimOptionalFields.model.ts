import mongoose from "mongoose";

const PimOptionalFieldsSchema = new mongoose.Schema(
  {
    showNickName: { type: Boolean, default: false },
    showSmoker: { type: Boolean, default: false },
    showMilitaryService: { type: Boolean, default: false },

    showSSN: { type: Boolean, default: false },
    showSIN: { type: Boolean, default: false },
    showUsTax: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("PimOptionalFields", PimOptionalFieldsSchema);
