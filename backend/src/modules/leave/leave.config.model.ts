import mongoose, { Schema, Document } from "mongoose";

export type WorkDayKind = "FULL" | "HALF" | "NONE";

export interface IWorkWeekConfig extends Document {
  monday: WorkDayKind;
  tuesday: WorkDayKind;
  wednesday: WorkDayKind;
  thursday: WorkDayKind;
  friday: WorkDayKind;
  saturday: WorkDayKind;
  sunday: WorkDayKind;
}

const WorkWeekConfigSchema = new Schema<IWorkWeekConfig>(
  {
    monday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "FULL" },
    tuesday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "FULL" },
    wednesday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "FULL" },
    thursday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "FULL" },
    friday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "FULL" },
    saturday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "NONE" },
    sunday: { type: String, enum: ["FULL", "HALF", "NONE"], default: "NONE" },
  },
  { timestamps: true }
);

export const WorkWeekConfig =
  mongoose.models.WorkWeekConfig ||
  mongoose.model<IWorkWeekConfig>("WorkWeekConfig", WorkWeekConfigSchema);

export interface IHoliday extends Document {
  name: string;
  date: Date;
  isHalfDay: boolean;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    isHalfDay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1 });

export const Holiday =
  mongoose.models.Holiday ||
  mongoose.model<IHoliday>("Holiday", HolidaySchema);
