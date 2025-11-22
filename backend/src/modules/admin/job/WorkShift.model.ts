import mongoose, { Schema, Document } from "mongoose";

export interface IWorkShift extends Document {
  name: string;
  hoursPerDay: number;
}

const WorkShiftSchema = new Schema<IWorkShift>(
  {
    name: { type: String, required: true, unique: true },
    hoursPerDay: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkShift>(
  "WorkShift",
  WorkShiftSchema
);
