// backend/src/modules/notifications/notification.model.ts
import mongoose, { Schema, InferSchemaType } from "mongoose";

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
  | "INVOICE"
  | "APPROVAL"; // ✅ ADD

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
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
        "APPROVAL", // ✅ ADD
      ],
      default: "INFO",
      index: true,
    },

    link: { type: String, default: "" },
    meta: { type: Schema.Types.Mixed, default: {} },

    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export type Notification = InferSchemaType<typeof notificationSchema>;

export const NotificationModel =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
