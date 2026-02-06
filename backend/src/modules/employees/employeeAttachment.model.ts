import mongoose, { Schema, Document } from "mongoose";

export interface IEmployeeAttachment extends Document {
  employeeId: mongoose.Types.ObjectId;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  description?: string;
  url: string; // served via /uploads static
  addedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeAttachmentSchema = new Schema<IEmployeeAttachment>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },

    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },

    description: { type: String },
    url: { type: String, required: true },

    addedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export const EmployeeAttachment = mongoose.model<IEmployeeAttachment>(
  "EmployeeAttachment",
  EmployeeAttachmentSchema
);
