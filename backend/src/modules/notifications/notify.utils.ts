import { Types } from "mongoose";
import { User } from "../auth/auth.model"; // adjust to your User model path
import { createNotification } from "./notification.service";
import { NotificationType } from "./notification.model";

export async function notifyUsers(input: {
  userIds: (string | Types.ObjectId)[];
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
  meta?: Record<string, any>;
}) {
  const tasks = input.userIds.map((id) =>
    createNotification({
      userId: id,
      title: input.title,
      message: input.message,
      type: input.type,
      link: input.link,
      meta: input.meta,
    })
  );
  await Promise.all(tasks);
}

export async function notifyRoles(input: {
  roles: string[]; // ["Admin","HR","Manager"]
  title: string;
  message?: string;
  type?: NotificationType;
  link?: string;
  meta?: Record<string, any>;
}) {
  const users = await User.find({ role: { $in: input.roles } }, { _id: 1 }).lean();
  await notifyUsers({
    userIds: users.map((u: any) => u._id),
    title: input.title,
    message: input.message,
    type: input.type,
    link: input.link,
    meta: input.meta,
  });
}