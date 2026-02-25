import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, IUser, UserRole } from "./auth.model";
import { ApiError } from "../../utils/ApiError";

function normalizeUsername(u: string) {
  return String(u || "").trim().toLowerCase();
}

function buildUserPayload(user: IUser) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    firstName: (user as any).firstName,
    lastName: (user as any).lastName,
    email: (user as any).email,
  };
}

// POST /api/auth/admin/create-user   (protected)
export async function adminCreateUser(req: Request, res: Response) {
  const { username, email, password, firstName, lastName, role } = req.body as {
    username: string;
    email?: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };

  if (!username || !password || !firstName || !lastName || !role) {
    throw ApiError.badRequest(
      "username, password, firstName, lastName, role are required"
    );
  }

  const allowed: UserRole[] = ["ADMIN", "HR", "SUPERVISOR", "ESS", "ESS_VIEWER"];
  if (!allowed.includes(role)) {
    throw ApiError.badRequest("Invalid role");
  }

  const normalizedUsername = normalizeUsername(username);

  const existing = await User.findOne({ username: normalizedUsername })
    .collation({ locale: "en", strength: 2 })
    .exec();

  if (existing) throw new ApiError(409, "User already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: normalizedUsername,
    email,
    passwordHash,
    firstName,
    lastName,
    role,
    isActive: true,
  });

  return res.status(201).json({ user: buildUserPayload(user) });
}