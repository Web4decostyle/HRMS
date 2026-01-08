import { Types } from "mongoose";
import { Notification, NotificationType } from "./notification.model";
import { getIO } from "../../socket";

export async function createNotification(input: {
  userId: string | Types.ObjectId;
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
  meta?: Record<string, any>;
}) {
  const userId =
    typeof input.userId === "string"
      ? new Types.ObjectId(input.userId)
      : input.userId;

  const doc = await Notification.create({
    userId,
    title: input.title,
    message: input.message,
    type: input.type ?? "INFO",
    link: input.link,
    meta: input.meta,
  });

  // 🔥 REAL-TIME PUSH
  try {
    const io = getIO();
    io.to(String(userId)).emit("notification:new", {
      id: doc._id,
      title: doc.title,
      type: doc.type,
      createdAt: doc.createdAt,
    });
  } catch {
    // socket not initialized (safe fallback)
  }

  return doc;
}
