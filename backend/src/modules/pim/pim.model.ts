// backend/src/modules/pim/pim.model.ts
import mongoose, { Schema, Document } from "mongoose";

/* -------- Emergency Contacts -------- */

export interface IEmergencyContact extends Document {
  employee: mongoose.Types.ObjectId;
  name: string;
  relationship?: string;
  homePhone?: string;
  mobilePhone?: string;
  workPhone?: string;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    relationship: { type: String },
    homePhone: { type: String },
    mobilePhone: { type: String },
    workPhone: { type: String },
  },
  { timestamps: true }
);

export const EmergencyContact = mongoose.model<IEmergencyContact>(
  "EmergencyContact",
  EmergencyContactSchema
);

/* -------- Dependents -------- */

export interface IDependent extends Document {
  employee: mongoose.Types.ObjectId;
  name: string;
  relationship?: string;
  dateOfBirth?: Date;
}

const DependentSchema = new Schema<IDependent>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    relationship: { type: String },
    dateOfBirth: { type: Date },
  },
  { timestamps: true }
);

export const Dependent = mongoose.model<IDependent>(
  "Dependent",
  DependentSchema
);

/* -------- Education -------- */

export interface IEducation extends Document {
  employee: mongoose.Types.ObjectId;
  level?: string; // e.g. Bachelors, Masters, etc.
  institute?: string;
  major?: string;
  year?: string;
  score?: string;
}

const EducationSchema = new Schema<IEducation>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    level: { type: String },
    institute: { type: String },
    major: { type: String },
    year: { type: String },
    score: { type: String },
  },
  { timestamps: true }
);

export const Education = mongoose.model<IEducation>(
  "Education",
  EducationSchema
);

/* -------- Work Experience -------- */

export interface IWorkExperience extends Document {
  employee: mongoose.Types.ObjectId;
  employer: string;
  jobTitle?: string;
  fromDate?: Date;
  toDate?: Date;
  comment?: string;
}

const WorkExperienceSchema = new Schema<IWorkExperience>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employer: { type: String, required: true },
    jobTitle: { type: String },
    fromDate: { type: Date },
    toDate: { type: Date },
    comment: { type: String },
  },
  { timestamps: true }
);

export const WorkExperience = mongoose.model<IWorkExperience>(
  "WorkExperience",
  WorkExperienceSchema
);
