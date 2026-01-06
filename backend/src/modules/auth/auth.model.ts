import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "ADMIN" | "ESS" | "ESS_VIEWER" | "HR" | "SUPERVISOR";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
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
    passwordHash: {
      type: String,
      required: true,
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
