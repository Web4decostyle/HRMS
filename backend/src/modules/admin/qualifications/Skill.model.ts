import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  description?: string;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ISkill>("Skill", SkillSchema);
