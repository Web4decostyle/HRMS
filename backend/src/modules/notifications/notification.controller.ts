// backend/src/modules/notifications/notification.controller.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import { NotificationModel } from "./notification.model";

function getUserId(req: any) {
  // Your auth middleware sets req.user.id (string)
  const id = req.user?.id || req.user?._id || req.userId;
  if (!id) return null;
  return new Types.ObjectId(String(id));
}

// GET /api/notifications?limit=10&cursor=<createdAtISO>
export async function listMyNotifications(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const cursor = String(req.query.cursor || "").trim();

  const filter: any = { userId };
  if (cursor) {
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const items = await NotificationModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;
  const nextCursor = hasMore ? sliced[sliced.length - 1]?.createdAt : null;

  res.json({
    items: sliced,
    nextCursor,
    hasMore,
  });
}

// GET /api/notifications/unread-count
export async function unreadCount(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const count = await NotificationModel.countDocuments({ userId, isRead: false });
  res.json({ count });
}

// PATCH /api/notifications/:id/read
export async function markRead(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = String(req.params.id);

  const updated = await NotificationModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true } },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ message: "Notification not found" });
  res.json({ item: updated });
}

// PATCH /api/notifications/mark-all-read
export async function markAllRead(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const result = await NotificationModel.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ modified: (result as any).modifiedCount ?? 0 });
}

// DELETE /api/notifications/:id
export async function deleteNotification(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = String(req.params.id);
  const deleted = await NotificationModel.findOneAndDelete({ _id: id, userId }).lean();

  if (!deleted) return res.status(404).json({ message: "Notification not found" });
  res.json({ ok: true });
}
