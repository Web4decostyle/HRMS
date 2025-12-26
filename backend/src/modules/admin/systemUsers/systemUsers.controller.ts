import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { ApiError } from "../../../utils/ApiError";
import { User } from "../../auth/auth.model";

function getNameParts(employeeName: string | undefined, username: string) {
  const full = (employeeName || "").trim();
  const parts = full.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || username;
  const lastName = parts.slice(1).join(" ") || "User";
  return { firstName, lastName };
}

function normalizeUsername(u: string) {
  // normalize spaces + case
  return u.trim().toLowerCase();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPasswordFieldName(): "passwordHash" | "password" {
  if ((User as any).schema?.path?.("passwordHash")) return "passwordHash";
  if ((User as any).schema?.path?.("password")) return "password";
  return "passwordHash";
}

export async function listSystemUsers(req: Request, res: Response) {
  const { username, role, status } = req.query as {
    username?: string;
    role?: string;
    status?: string;
  };

  const filter: any = {};
  if (username) filter.username = { $regex: username, $options: "i" };
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
      employeeName:
        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username,
    }))
  );
}

export async function createSystemUser(req: Request, res: Response) {
  try {
    const { username, password, role, status, employeeName } = req.body as {
      username?: string;
      password?: string;
      role?: "ADMIN" | "HR" | "ESS" | "ESS_VIEWER";
      status?: "ENABLED" | "DISABLED";
      employeeName?: string;
    };

    if (!username || !password) {
      throw ApiError.badRequest("username and password are required");
    }

    const normalized = normalizeUsername(username);

    const allowedRoles = new Set(["ADMIN", "HR", "ESS", "ESS_VIEWER"]);
    const finalRole = role && allowedRoles.has(role) ? role : "ESS";

    // ✅ Important: find conflicts even if DB has weird casing/spaces
    // - exact match by normalized
    // - case-insensitive exact match (helps you debug old data)
const conflict = await User.findOne({ username: normalized })
  .collation({ locale: "en", strength: 2 }) // 👈 IMPORTANT
  .lean();

if (conflict) {
  throw ApiError.conflict(
    `Username already exists (conflict with: "${conflict.username}")`
  );
}


    const { firstName, lastName } = getNameParts(employeeName, normalized);
    const hashed = await bcrypt.hash(password, 10);

    const passwordField = getPasswordFieldName();

    const payload: any = {
      username: normalized,
      firstName,
      lastName,
      role: finalRole,
      isActive: status ? status === "ENABLED" : true,
    };
    payload[passwordField] = hashed;

    const user = await User.create(payload);

    res.status(201).json({
      _id: user._id,
      username: (user as any).username,
      role: (user as any).role,
      status: (user as any).isActive ? "ENABLED" : "DISABLED",
      employeeName: `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim(),
    });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      throw ApiError.badRequest(err.message);
    }
    if (err?.code === 11000) {
      throw ApiError.conflict("Username already exists (duplicate key index)");
    }
    throw err;
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
    employeeName: `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim(),
  });
}

export async function deleteSystemUser(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("System user not found");

  res.status(204).send();
}
