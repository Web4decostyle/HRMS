import mongoose from "mongoose";

const PimImportHistorySchema = new mongoose.Schema(
  {
    fileName: String,
    status: { type: String, enum: ["PENDING", "COMPLETED"], default: "PENDING" },
    totalRecords: Number,
    processedRecords: Number,
  },
  { timestamps: true }
);

export default mongoose.model("PimImportHistory", PimImportHistorySchema);
