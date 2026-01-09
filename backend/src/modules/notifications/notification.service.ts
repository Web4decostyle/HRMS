// backend/src/modules/notifications/notification.service.ts
import mongoose from "mongoose";
import { NotificationModel, type NotificationType } from "./notification.model";

export async function createNotification(input: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
  meta?: any;
}) {
  const doc = await NotificationModel.create({
    userId: new mongoose.Types.ObjectId(input.userId),
    title: input.title,
    message: input.message,
    type: input.type || "INFO",
    link: input.link || "",
    meta: input.meta || {},
    isRead: false,
  });

  /**
   * ✅ IMPORTANT:
   * Your project socket.ts does NOT export `emitToUser`.
   * So we don't push realtime here.
   * Notifications still work via DB fetch (/notifications endpoints).
   *
   * If you want realtime popups later, share `backend/src/socket.ts`
   * and I will wire it to your existing socket server correctly.
   */

  return doc;
}
