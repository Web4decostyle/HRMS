import mongoose, { Schema, Document } from "mongoose";

export interface ILicense extends Document {
  name: string;
}

const LicenseSchema = new Schema<ILicense>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILicense>("License", LicenseSchema);
