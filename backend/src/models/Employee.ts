// server/src/models/Employee.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  employeeId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  gender?: "Male" | "Female" | string;
  dob?: Date | null;
  phone?: string;
  department?: string;
  jobTitle?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, index: true, unique: false, sparse: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, lowercase: true, index: true, unique: false, sparse: true },
    gender: { type: String },
    dob: { type: Date },
    phone: { type: String },
    department: { type: String },
    jobTitle: { type: String },
    location: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
