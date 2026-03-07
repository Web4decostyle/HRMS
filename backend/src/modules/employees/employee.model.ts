import mongoose, { Schema, Document } from "mongoose";

export type EmployeeLevel = "MANAGER" | "TL" | "GRADE1" | "GRADE2";

export interface IEmployee extends Document {
  employeeId: string;
  firstName: string;
  middleName?: string; // ✅ NEW
  lastName: string;
  email: string;

  phone?: string;
  jobTitle?: string;
  department?: string;
  location?: string;

  // ✅ Division-based org
  division?: mongoose.Types.ObjectId | null;

  // ✅ Sub-division
  subDivision?: mongoose.Types.ObjectId | null;

  // ✅ hierarchy
  level?: EmployeeLevel;
  reportsTo?: mongoose.Types.ObjectId | null;

  status: "ACTIVE" | "INACTIVE";
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ NEW FIELD
    middleName: {
      type: String,
      trim: true,
      default: "",
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      trim: true,
    },

    jobTitle: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

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

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>("Employee", EmployeeSchema);