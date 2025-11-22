import mongoose, { Schema, Document } from "mongoose";

export interface IEducation extends Document {
  level: string;
}

const EducationSchema = new Schema<IEducation>(
  {
    level: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<IEducation>("Education", EducationSchema);
