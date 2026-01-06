import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../../../utils/ApiError";
import { User } from "../../auth/auth.model";

function normalizeUsername(u: string) {
  return String(u || "").trim().toLowerCase();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const allowedRoles = new Set([
  "ADMIN",
  "HR",
  "ESS",
  "ESS_VIEWER",
  "SUPERVISOR",
]);

export async function listSystemUsers(req: Request, res: Response) {
  const { username, role, status } = req.query as {
    username?: string;
    role?: string;
    status?: string;
  };

  const filter: any = {};

  if (username) {
    const safe = escapeRegex(username);
    filter.username = { $regex: safe, $options: "i" };
  }

  if (role) filter.role = role;

  if (status === "ENABLED") filter.isActive = true;
  if (status === "DISABLED") filter.isActive = false;

  const users = await User.find(filter).sort({ createdAt: -1 }).lean();

  res.json(
    users.map((u: any) => ({
      _id: u._id,
      username: u.username,
      role: u.role,
      status: u.isActive ? "ENABLED" : "DISABLED",
      employeeName: u.username, // kept for frontend compatibility
    }))
  );
}

export async function createSystemUser(req: Request, res: Response) {
  try {
    const { username, password, role, status } = req.body as {
      username?: string;
      password?: string;
      status?: "ENABLED" | "DISABLED";
      role?: "ADMIN" | "HR" | "ESS" | "ESS_VIEWER" | "SUPERVISOR";
    };

    // ✅ Required: username + password only
    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    const normalizedUsername = normalizeUsername(username);

    // ✅ username uniqueness (you already normalize to lowercase, so direct lookup is enough)
    const existing = await User.findOne({ username: normalizedUsername }).exec();
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const finalRole =
      role && allowedRoles.has(role as string) ? role : "ESS";

    const doc: any = {
      username: normalizedUsername,
      passwordHash,
      role: finalRole,
      isActive: status ? status === "ENABLED" : true,
    };

    const user = await User.create(doc);

    return res.status(201).json({
      user: {
        id: user.id,
        _id: (user as any)._id,
        username: (user as any).username,
        role: (user as any).role,
        isActive: (user as any).isActive,
      },
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      const key = err?.keyPattern ? Object.keys(err.keyPattern)[0] : "field";
      return res.status(409).json({
        message: `Duplicate ${key}. Please use another value.`,
      });
    }

    return res.status(500).json({ message: err?.message || "Server error" });
  }
}

export async function updateSystemUserStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status?: "ENABLED" | "DISABLED" };

  if (!status || !["ENABLED", "DISABLED"].includes(status)) {
    throw ApiError.badRequest('status must be "ENABLED" or "DISABLED"');
  }

  const user = await User.findById(id);
  if (!user) throw ApiError.notFound("System user not found");

  (user as any).isActive = status === "ENABLED";
  await user.save();

  res.json({
    _id: user._id,
    username: (user as any).username,
    role: (user as any).role,
    status: (user as any).isActive ? "ENABLED" : "DISABLED",
    employeeName: (user as any).username, // kept for frontend compatibility
  });
}

export async function deleteSystemUser(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("System user not found");

  res.status(204).send();
}
