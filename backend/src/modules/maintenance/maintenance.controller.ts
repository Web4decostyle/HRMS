// backend/src/modules/maintenance/maintenance.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../../middleware/authMiddleware";
import { User } from "../auth/auth.model";
import { JWT_SECRET } from "../../config/jwt";
import { ApiError } from "../../utils/ApiError";

export async function verifyMaintenance(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) throw ApiError.unauthorized("Not authenticated");

  const { password, scope } = req.body as { password?: string; scope?: string };
  if (!password || !scope)
    throw ApiError.badRequest("password and scope are required");

  const user = await User.findById(userId).exec();
  if (!user) throw ApiError.notFound("User not found");

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid password");

  const token = jwt.sign(
    { sub: user.id, typ: "maintenance", scope },
    JWT_SECRET!,
    { expiresIn: "60s" }
  );

  res.json({ maintenanceToken: token });
}

export async function getSystemInfo(_req: Request, res: Response) {
  res.json({
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: process.memoryUsage(),
    uptimeSeconds: process.uptime(),
  });
}
