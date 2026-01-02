import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "ADMIN" | "ESS" | "ESS_VIEWER" | "HR" | "SUPERVISOR";

export interface IUser extends Document {
  username: string;
  email?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // ✅ THIS IS THE FIX
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "ESS", "ESS_VIEWER", "HR", "SUPERVISOR"],
      default: "ESS",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
