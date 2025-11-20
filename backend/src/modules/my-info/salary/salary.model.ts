import mongoose, { Schema, Document } from "mongoose";

export interface ISalary extends Document {
  employeeId: mongoose.Types.ObjectId;
  componentName: string;
  amount: number;
  currency: string;
  payFrequency: string;
  directDepositAmount?: number;
}

const SalarySchema = new Schema<ISalary>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    componentName: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    payFrequency: { type: String, required: true },
    directDepositAmount: Number,
  },
  { timestamps: true }
);

export const Salary = mongoose.model<ISalary>("Salary", SalarySchema);
