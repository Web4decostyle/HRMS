// backend/src/modules/time/timesheet.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type TimesheetStatus = "OPEN" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface ITimesheetEntry {
  date: Date;
  project?: string;
  task?: string;
  hours: number;
  comment?: string;
}

export interface ITimesheet extends Document {
  employee: mongoose.Types.ObjectId;
  periodStart: Date; // start of week
  periodEnd: Date;   // end of week
  status: TimesheetStatus;
  entries: ITimesheetEntry[];
}

const TimesheetEntrySchema = new Schema<ITimesheetEntry>(
  {
    date: { type: Date, required: true },
    project: { type: String },
    task: { type: String },
    hours: { type: Number, required: true, min: 0 },
    comment: { type: String },
  },
  { _id: false }
);

const TimesheetSchema = new Schema<ITimesheet>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ["OPEN", "SUBMITTED", "APPROVED", "REJECTED"],
      default: "OPEN",
    },
    entries: { type: [TimesheetEntrySchema], default: [] },
  },
  { timestamps: true }
);

// You could also add a unique index for (employee, periodStart)
TimesheetSchema.index({ employee: 1, periodStart: 1 }, { unique: false });

export const Timesheet = mongoose.model<ITimesheet>(
  "Timesheet",
  TimesheetSchema
);
