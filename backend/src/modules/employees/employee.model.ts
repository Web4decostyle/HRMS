import mongoose, { Schema, Document } from "mongoose";

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  division?: mongoose.Types.ObjectId | null; // ✅ NEW
  location?: string;
  status: "ACTIVE" | "INACTIVE";
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },

    // ✅ Added to match Directory filters
    phone: { type: String },
    location: { type: String },

    jobTitle: String,
    department: String,

    // ✅ Division-based hierarchy
    division: { type: Schema.Types.ObjectId, ref: "Division", default: null, index: true },

    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
