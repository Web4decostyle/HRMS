import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceRegisterEntry extends Document {
  employeeId: string; // cardNo/payrollNo from Excel
  payrollNo?: string;
  cardNo?: string;
  employeeName?: string;

  date: string; // YYYY-MM-DD
  inTime?: string;
  outTime?: string;
  status?: string;

  month: string; // YYYY-MM

  importedBy?: mongoose.Types.ObjectId | null;
}

const AttendanceRegisterSchema = new Schema<IAttendanceRegisterEntry>(
  {
    employeeId: { type: String, required: true, index: true },
    payrollNo: { type: String },
    cardNo: { type: String },
    employeeName: { type: String },

    date: { type: String, required: true, index: true },
    inTime: { type: String },
    outTime: { type: String },
    status: { type: String },

    month: { type: String, required: true, index: true },
    importedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// ✅ Avoid duplicates when the same Excel is uploaded again
AttendanceRegisterSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const AttendanceRegisterEntry = mongoose.model<IAttendanceRegisterEntry>(
  "AttendanceRegisterEntry",
  AttendanceRegisterSchema
);