import mongoose, { Schema, Document } from "mongoose";

export type EmployeeLevel = "MANAGER" | "TL" | "GRADE1" | "GRADE2";

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;

  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;

  // ✅ Division-based org
  division?: mongoose.Types.ObjectId | null;

  // ✅ NEW: sub-division under a division
  subDivision?: mongoose.Types.ObjectId | null;

  // ✅ NEW: hierarchy inside division
  level?: EmployeeLevel; // default GRADE1
  reportsTo?: mongoose.Types.ObjectId | null; // points to TL/Manager

  status: "ACTIVE" | "INACTIVE";
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },

    phone: { type: String },
    location: { type: String },
    jobTitle: { type: String },
    department: { type: String },

    division: {
      type: Schema.Types.ObjectId,
      ref: "Division",
      default: null,
      index: true,
    },

    subDivision: {
      type: Schema.Types.ObjectId,
      ref: "SubDivision",
      default: null,
      index: true,
    },

    // ✅ NEW
    level: {
      type: String,
      enum: ["MANAGER", "TL", "GRADE1", "GRADE2"],
      default: "GRADE1",
      index: true,
    },
    reportsTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },

    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);
