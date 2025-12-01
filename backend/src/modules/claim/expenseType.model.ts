import { Schema, model, Document } from "mongoose";

export interface IExpenseType extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseTypeSchema = new Schema<IExpenseType>(
  {
    name: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true }
);

export const ExpenseType = model<IExpenseType>("ExpenseType", ExpenseTypeSchema);
