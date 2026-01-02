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
    // safer regex (avoid breaking search with special chars)
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
      employeeName:
        `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username,
    }))
  );
}

export async function createSystemUser(req: Request, res: Response) {
  try {
    const { username, email, password, firstName, lastName, role, employeeName, status } =
      req.body as {
        username?: string;
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        employeeName?: string;
        status?: "ENABLED" | "DISABLED";
        role?: "ADMIN" | "HR" | "ESS" | "ESS_VIEWER" | "SUPERVISOR";
      };

    // ✅ Required: username + password.
    // ✅ Names are required by your schema, so we will derive them if not provided.
    if (!username || !password) {
      return res.status(400).json({
        message: "username and password are required",
      });
    }

    const normalizedUsername = normalizeUsername(username);

    // ✅ Check username conflicts (case-insensitive)
    const existing = await User.findOne({ username: normalizedUsername })
      .collation({ locale: "en", strength: 2 })
      .exec();

    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const finalRole = role && allowedRoles.has(role as string) ? role : "ESS";

    // ✅ Ensure firstName/lastName always exist (schema requires them)
    let finalFirstName = (firstName || "").trim();
    let finalLastName = (lastName || "").trim();

    if (!finalFirstName || !finalLastName) {
      const derived = getNameParts(employeeName, normalizedUsername);
      if (!finalFirstName) finalFirstName = derived.firstName;
      if (!finalLastName) finalLastName = derived.lastName;
    }

    // ✅ Build payload safely so we NEVER store email: null/undefined
    const doc: any = {
      username: normalizedUsername,
      passwordHash,
      firstName: finalFirstName,
      lastName: finalLastName,
      role: finalRole,
      isActive: status ? status === "ENABLED" : true,
    };

    // ✅ Only attach email if provided (prevents duplicate key { email: null })
    if (email && String(email).trim()) {
      doc.email = String(email).trim().toLowerCase();
    }

    const user = await User.create(doc);

    return res.status(201).json({
      user: {
        id: user.id,
        _id: (user as any)._id,
        username: (user as any).username,
        // email: (user as any).email,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        role: (user as any).role,
        isActive: (user as any).isActive,
      },
    });
  } catch (err: any) {
    // ✅ Handle duplicate key errors with helpful message
    if (err?.code === 11000) {
      const key = err?.keyPattern
        ? Object.keys(err.keyPattern)[0]
        : "field";
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
    employeeName: `${(user as any).firstName ?? ""} ${
      (user as any).lastName ?? ""
    }`.trim(),
  });
}

export async function deleteSystemUser(req: Request, res: Response) {
  const { id } = req.params;

  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) throw ApiError.notFound("System user not found");

  res.status(204).send();
}