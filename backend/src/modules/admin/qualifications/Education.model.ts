import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export const Education =
  mongoose.models.Education || mongoose.model("Education", educationSchema);

