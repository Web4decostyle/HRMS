import mongoose, { Schema } from "mongoose";

type CounterDoc = mongoose.Document & {
  key: string;
  seq: number;
};

const CounterSchema = new Schema<CounterDoc>(
  {
    key: { type: String, required: true, unique: true, index: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const RecruitmentCounter =
  mongoose.models.RecruitmentCounter ||
  mongoose.model<CounterDoc>("RecruitmentCounter", CounterSchema);
