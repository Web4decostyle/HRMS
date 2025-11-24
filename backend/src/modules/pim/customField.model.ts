import mongoose from "mongoose";

const CustomFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    screen: { type: String, required: true },
    type: { type: String, enum: ["Text", "Number", "Dropdown"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("CustomField", CustomFieldSchema);
