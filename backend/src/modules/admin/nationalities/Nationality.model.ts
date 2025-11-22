import mongoose, { Schema, Document } from "mongoose";

export interface INationality extends Document {
  name: string;
}

const NationalitySchema = new Schema<INationality>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<INationality>(
  "Nationality",
  NationalitySchema
);
