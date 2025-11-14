// backend/src/modules/attendance/attendance.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type AttendanceStatus = "OPEN" | "CLOSED";

export interface IAttendanceRecord extends Document {
  employee: mongoose.Types.ObjectId;
  date: Date;
  inTime: Date;
  outTime?: Date | null;
  status: AttendanceStatus;
}

const AttendanceSchema = new Schema<IAttendanceRecord>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    inTime: { type: Date, required: true },
    outTime: { type: Date, default: null },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },
  },
  { timestamps: true }
);

AttendanceSchema.index({ employee: 1, date: 1 });

export const Attendance = mongoose.model<IAttendanceRecord>(
  "Attendance",
  AttendanceSchema
);
