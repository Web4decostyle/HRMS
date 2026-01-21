// backend/src/modules/leave/leave.config.model.ts
import mongoose, { Schema, Document } from "mongoose";

export type WorkDayConfig = "FULL" | "HALF" | "NONE";

export interface IWorkWeekConfig extends Document {
  monday: WorkDayConfig;
  tuesday: WorkDayConfig;
  wednesday: WorkDayConfig;
  thursday: WorkDayConfig;
  friday: WorkDayConfig;
  saturday: WorkDayConfig;
  sunday: WorkDayConfig;
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

export const WorkWeekConfig = mongoose.model<IWorkWeekConfig>(
  "WorkWeekConfig",
  WorkWeekConfigSchema
);

export interface IHoliday extends Document {
  name: string;
  date: Date;
  isHalfDay: boolean;
  repeatsAnnually: boolean;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    isHalfDay: { type: Boolean, default: false },
    repeatsAnnually: { type: Boolean, default: false },
  },
  { timestamps: true }
);

HolidaySchema.index({ date: 1 });

export const Holiday = mongoose.model<IHoliday>("Holiday", HolidaySchema);
