// backend/src/modules/admin/admin.model.ts
import mongoose, { Schema, Document } from "mongoose";

/* ---------- Org Unit (Organization → Structure) ---------- */

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

/* ---------- Job Title (Admin → Job → Job Titles) ---------- */

export interface IJobTitle extends Document {
  name: string;
  code?: string;
  description?: string;
}

const JobTitleSchema = new Schema<IJobTitle>(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export const JobTitle = mongoose.model<IJobTitle>("JobTitle", JobTitleSchema);

/* ---------- Pay Grade (Admin → Job → Pay Grades) ---------- */

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

export const PayGrade = mongoose.model<IPayGrade>("PayGrade", PayGradeSchema);

/* ---------- Employment Status (Admin → Job → Employment Status) ---------- */

export interface IEmploymentStatus extends Document {
  name: string;
}

const EmploymentStatusSchema = new Schema<IEmploymentStatus>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const EmploymentStatus = mongoose.model<IEmploymentStatus>(
  "EmploymentStatus",
  EmploymentStatusSchema
);

/* ---------- Job Category (Admin → Job → Job Categories) ---------- */

export interface IJobCategory extends Document {
  name: string;
}

const JobCategorySchema = new Schema<IJobCategory>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const JobCategory = mongoose.model<IJobCategory>(
  "JobCategory",
  JobCategorySchema
);

/* ---------- Work Shift (Admin → Job → Work Shifts) ---------- */

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

export const WorkShift = mongoose.model<IWorkShift>(
  "WorkShift",
  WorkShiftSchema
);

/* ---------- Location (Admin → Organization → Locations) ---------- */

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

/* ---------- General Org Info (Admin → Organization → General Information) ---------- */

export interface IGeneralInfo extends Document {
  companyName: string;
  taxId?: string;
  registrationNumber?: string;
  phone?: string;
  fax?: string;
  email?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

const GeneralInfoSchema = new Schema<IGeneralInfo>(
  {
    companyName: { type: String, required: true },
    taxId: { type: String },
    registrationNumber: { type: String },
    phone: { type: String },
    fax: { type: String },
    email: { type: String },
    street1: { type: String },
    street2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

export const GeneralInfo = mongoose.model<IGeneralInfo>(
  "GeneralInfo",
  GeneralInfoSchema
);

/* ---------- Qualifications: Skills ---------- */

export interface ISkill extends Document {
  name: string;
  description?: string;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const Skill = mongoose.model<ISkill>("Skill", SkillSchema);

/* ---------- Qualifications: Education Levels ---------- */

export interface EducationLevel extends Document {
  level: string;
}

const EducationLevelSchema = new Schema<EducationLevel>({
  level: { type: String, required: true, trim: true, unique: true },
});

export const EducationLevel = mongoose.model<EducationLevel>(
  "EducationLevel",
  EducationLevelSchema
);

/* ---------- Qualifications: Languages ---------- */

export interface ILanguage extends Document {
  name: string;
}

const LanguageSchema = new Schema<ILanguage>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Language = mongoose.model<ILanguage>(
  "Language",
  LanguageSchema
);

/* ---------- Qualifications: Licenses ---------- */

export interface ILicense extends Document {
  name: string;
}

const LicenseSchema = new Schema<ILicense>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const License = mongoose.model<ILicense>(
  "License",
  LicenseSchema
);

/* ---------- Nationalities ---------- */

export interface INationality extends Document {
  name: string;
}

const NationalitySchema = new Schema<INationality>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Nationality = mongoose.model<INationality>(
  "Nationality",
  NationalitySchema
);
