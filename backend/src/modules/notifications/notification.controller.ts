import { Request, Response } from "express";
import { Types } from "mongoose";
import { Notification } from "./notification.model";

function getUserId(req: any) {
  // adjust if your auth middleware uses different shape:
  // req.user._id OR req.userId OR req.user.id
  const id = req.user?._id || req.userId || req.user?.id;
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
    // paginate by createdAt
    filter.createdAt = { $lt: new Date(cursor) };
  }

  const items = await Notification.find(filter)
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

  const count = await Notification.countDocuments({ userId, read: false });
  res.json({ count });
}

// PATCH /api/notifications/:id/read
export async function markRead(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = String(req.params.id);
  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { read: true } },
    { new: true }
  ).lean();

  if (!updated) return res.status(404).json({ message: "Notification not found" });
  res.json({ item: updated });
}

// PATCH /api/notifications/mark-all-read
export async function markAllRead(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const result = await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true } }
  );

  res.json({ modified: result.modifiedCount ?? 0 });
}

// DELETE /api/notifications/:id
export async function deleteNotification(req: Request, res: Response) {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const id = String(req.params.id);
  const deleted = await Notification.findOneAndDelete({ _id: id, userId }).lean();

  if (!deleted) return res.status(404).json({ message: "Notification not found" });
  res.json({ ok: true });
}
