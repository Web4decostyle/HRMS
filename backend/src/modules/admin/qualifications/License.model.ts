import mongoose from "mongoose";

const licenseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const License =
  mongoose.models.License || mongoose.model("License", licenseSchema);