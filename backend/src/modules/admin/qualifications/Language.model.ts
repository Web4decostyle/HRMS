import mongoose, { Schema, Document } from "mongoose";

export interface ILanguage extends Document {
  name: string;
}

const LanguageSchema = new Schema<ILanguage>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<ILanguage>("Language", LanguageSchema);
