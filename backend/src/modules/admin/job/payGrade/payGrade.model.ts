import mongoose, { Schema, Document, Model } from "mongoose";

export interface PayGradeDoc extends Document {
  name: string;
  currency?: string;
  minSalary?: number;
  maxSalary?: number;
  createdAt: Date;
  updatedAt: Date;
}

const payGradeSchema = new Schema<PayGradeDoc>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    currency: { type: String, trim: true },
    minSalary: { type: Number },
    maxSalary: { type: Number },
  },
  { timestamps: true }
);

// avoid OverwriteModelError with ts-node-dev
export const PayGrade: Model<PayGradeDoc> =
  (mongoose.models.PayGrade as Model<PayGradeDoc>) ||
  mongoose.model<PayGradeDoc>("PayGrade", payGradeSchema);
