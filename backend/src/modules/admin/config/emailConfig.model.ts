import mongoose, { Schema, Document } from "mongoose";

export interface IEmailConfig extends Document {
  mailSentAs: string;
  sendingMethod: "SMTP" | "SECURE_SMTP" | "SENDMAIL";
  smtpHost: string;
  smtpPort: number;
  useAuth: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  tls: boolean;
}

const EmailConfigSchema = new Schema<IEmailConfig>(
  {
    mailSentAs: { type: String, required: true },
    sendingMethod: {
      type: String,
      enum: ["SMTP", "SECURE_SMTP", "SENDMAIL"],
      default: "SMTP",
    },
    smtpHost: { type: String, required: true },
    smtpPort: { type: Number, required: true },
    useAuth: { type: Boolean, default: false },
    smtpUser: { type: String },
    smtpPassword: { type: String },
    tls: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const EmailConfig =
  mongoose.models.EmailConfig ||
  mongoose.model<IEmailConfig>("EmailConfig", EmailConfigSchema);
