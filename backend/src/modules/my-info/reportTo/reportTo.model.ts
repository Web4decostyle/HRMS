import mongoose, { Schema, Document } from "mongoose";

export interface ISupervisor extends Document {
  employeeId: mongoose.Types.ObjectId;
  supervisorId: mongoose.Types.ObjectId;
  reportingMethod?: string;
}

export interface ISubordinate extends Document {
  employeeId: mongoose.Types.ObjectId;
  subordinateId: mongoose.Types.ObjectId;
  reportingMethod?: string;
}

const SupervisorSchema = new Schema<ISupervisor>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reportingMethod: { type: String, default: "Direct" },
  },
  { timestamps: true }
);

const SubordinateSchema = new Schema<ISubordinate>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    subordinateId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    reportingMethod: { type: String, default: "Direct" },
  },
  { timestamps: true }
);

export const Supervisor = mongoose.model<ISupervisor>(
  "Supervisor",
  SupervisorSchema
);

export const Subordinate = mongoose.model<ISubordinate>(
  "Subordinate",
  SubordinateSchema
);
