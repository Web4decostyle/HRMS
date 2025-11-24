import mongoose from "mongoose";

const languageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    fluency: { type: String, enum: ["Writing", "Speaking", "Reading"], default: "Writing" },
    competency: { type: String, enum: ["Poor", "Good", "Excellent"], default: "Good" },
  },
  { timestamps: true }
);

export const Language =
  mongoose.models.Language || mongoose.model("Language", languageSchema);