import mongoose, { Schema, Types } from "mongoose";

export interface AttendanceSessionDoc extends mongoose.Document {
  userId: Types.ObjectId;
  punchInAt: Date;
  punchInNote?: string;
  punchOutAt?: Date | null;
  punchOutNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSessionSchema = new Schema<AttendanceSessionDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    punchInAt: { type: Date, required: true, index: true },
    punchInNote: { type: String, default: "" },

    punchOutAt: { type: Date, default: null, index: true },
    punchOutNote: { type: String, default: "" },
  },
  { timestamps: true }
);

// helpful index for daily queries
AttendanceSessionSchema.index({ userId: 1, punchInAt: 1 });

export const AttendanceSession =
  mongoose.models.AttendanceSession ||
  mongoose.model<AttendanceSessionDoc>("AttendanceSession", AttendanceSessionSchema);
