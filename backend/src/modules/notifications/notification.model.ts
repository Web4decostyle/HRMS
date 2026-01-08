import { Schema, model, Types } from "mongoose";

export type NotificationType =
  | "SYSTEM"
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "TASK"
  | "LEAVE"
  | "TIME"
  | "RECRUITMENT"
  | "PIM"
  | "ORDER"
  | "INVOICE";

export interface INotification {
  userId: Types.ObjectId;
  title: string;
  message?: string;
  type: NotificationType;
  read: boolean;
  link?: string; // frontend route like "/leave/requests"
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    type: {
      type: String,
      default: "INFO",
      enum: [
        "SYSTEM",
        "INFO",
        "SUCCESS",
        "WARNING",
        "ERROR",
        "TASK",
        "LEAVE",
        "TIME",
        "RECRUITMENT",
        "PIM",
        "ORDER",
        "INVOICE",
      ],
    },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, trim: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = model<INotification>("Notification", notificationSchema);
