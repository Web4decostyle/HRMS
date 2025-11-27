import mongoose, { Schema, Document } from "mongoose";

export type CustomFieldType = "text" | "dropdown";

export interface ICustomField extends Document {
  fieldName: string;
  screen: string;
  type: CustomFieldType;
  dropdownOptions?: string[];
  required: boolean;
  active: boolean;
}

const CustomFieldSchema = new Schema<ICustomField>(
  {
    fieldName: { type: String, required: true },
    screen: { type: String, required: true }, // personal, contact, emergency, dependents, immigration
    type: { type: String, enum: ["text", "dropdown"], required: true },

    dropdownOptions: [{ type: String }],

    required: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CustomField = mongoose.model<ICustomField>(
  "CustomField",
  CustomFieldSchema
);
