// backend/src/modules/admin/admin.model.ts
import mongoose, { Schema, Document } from "mongoose";

/* ---------- Org Unit ---------- */

export interface IOrgUnit extends Document {
  name: string;
  code?: string;
  parent?: mongoose.Types.ObjectId | null;
  description?: string;
}

const OrgUnitSchema = new Schema<IOrgUnit>(
  {
    name: { type: String, required: true },
    code: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: "OrgUnit", default: null },
    description: { type: String },
  },
  { timestamps: true }
);

export const OrgUnit = mongoose.model<IOrgUnit>("OrgUnit", OrgUnitSchema);

/* ---------- Job Title ---------- */

export interface IJobTitle extends Document {
  name: string;
  code?: string;
  description?: string;
}

const JobTitleSchema = new Schema<IJobTitle>(
  {
    name: { type: String, required: true },
    code: { type: String, unique: true, sparse: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const JobTitle = mongoose.model<IJobTitle>(
  "JobTitle",
  JobTitleSchema
);

/* ---------- Pay Grade ---------- */

export interface IPayGrade extends Document {
  name: string;
  currency?: string;
  minSalary?: number;
  maxSalary?: number;
}

const PayGradeSchema = new Schema<IPayGrade>(
  {
    name: { type: String, required: true, unique: true },
    currency: { type: String, default: "INR" },
    minSalary: { type: Number },
    maxSalary: { type: Number },
  },
  { timestamps: true }
);

export const PayGrade = mongoose.model<IPayGrade>(
  "PayGrade",
  PayGradeSchema
);

/* ---------- Location ---------- */

export interface ILocation extends Document {
  name: string;
  city?: string;
  country?: string;
  address?: string;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true },
    city: { type: String },
    country: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

export const Location = mongoose.model<ILocation>("Location", LocationSchema);
