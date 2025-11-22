// backend/src/modules/admin/systemUsers.controller.ts
import { Request, Response } from "express";
import { ApiError } from "../../../utils/ApiError";
import { SystemUser } from "./systemUser.model";

/**
 * GET /api/admin/system-users
 * Query: username?, role?, status?
 */
export async function listSystemUsers(req: Request, res: Response) {
  const { username, role, status } = req.query as {
    username?: string;
    role?: string;
    status?: string;
  };

  const filter: any = {};
  if (username) filter.username = { $regex: username, $options: "i" };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const users = await SystemUser.find(filter).sort({ username: 1 }).lean();
  res.json(users);
}

/**
 * POST /api/admin/system-users
 * body: { username, password, role, status?, employeeName? }
 */
export async function createSystemUser(req: Request, res: Response) {
  const { username, password, role, status, employeeName } = req.body;

  if (!username || !password) {
    throw ApiError.badRequest("username and password are required");
  }

  const existing = await SystemUser.findOne({ username });
  if (existing) {
    throw ApiError.conflict("Username already exists");
  }

  const user = await SystemUser.create({
    username,
    password,
    role: role || "ESS",
    status: status || "ENABLED",
    employeeName: employeeName || undefined,
  });

  res.status(201).json({
    _id: user._id,
    username: user.username,
    role: user.role,
    status: user.status,
    employeeName: user.employeeName,
  });
}

/**
 * PATCH /api/admin/system-users/:id/status
 * body: { status: "ENABLED" | "DISABLED" }
 */
export async function updateSystemUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  const user = await SystemUser.findById(id);
  if (!user) throw ApiError.notFound("System user not found");

  if (!["ENABLED", "DISABLED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  user.status = status;
  await user.save();

  res.json({
    _id: user._id,
    username: user.username,
    role: user.role,
    status: user.status,
    employeeName: user.employeeName,
  });
}

/**
 * DELETE /api/admin/system-users/:id
 */
export async function deleteSystemUser(req: Request, res: Response) {
  const { id } = req.params;
  const deleted = await SystemUser.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("System user not found");
  res.status(204).send();
}
