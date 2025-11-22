import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface ISystemUser extends Document {
  username: string;
  password: string;
  role: "ADMIN" | "HR" | "ESS";
  status: "ENABLED" | "DISABLED";
  employee?: mongoose.Types.ObjectId;

  comparePassword(candidate: string): Promise<boolean>;
}

const SystemUserSchema = new Schema<ISystemUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["ADMIN", "HR", "ESS"],
      default: "ESS",
    },

    status: {
      type: String,
      enum: ["ENABLED", "DISABLED"],
      default: "ENABLED",
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
SystemUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

SystemUserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<ISystemUser>("SystemUser", SystemUserSchema);
