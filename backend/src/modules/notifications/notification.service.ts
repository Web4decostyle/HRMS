// backend/src/modules/notifications/notification.service.ts
import mongoose from "mongoose";
import { NotificationModel, type NotificationType } from "./notification.model";
import { getIO } from "../../socket";

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

  // ✅ Real-time push (frontend listens to `notification:new`)
  // - Socket rooms are joined via `socket.emit('join', userId)`
  // - If socket server isn't initialized yet, we silently ignore.
  try {
    const io = getIO();
    io.to(String(input.userId)).emit("notification:new", {
      id: String(doc._id),
      type: doc.type,
      title: doc.title,
    });
  } catch {
    // ignore
  }

  return doc;
}
