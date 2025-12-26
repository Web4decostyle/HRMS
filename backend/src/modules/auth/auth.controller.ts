import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "./auth.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/jwt";
import { ApiError } from "../../utils/ApiError";

function normalizeUsername(u: string) {
  return String(u || "").trim().toLowerCase();
}

function buildUserPayload(user: IUser) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
  };
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { username, email, password, firstName, lastName, role, isActive } =
    req.body;

  if (!username || !password || !firstName || !lastName) {
    throw ApiError.badRequest(
      "username, password, firstName, lastName are required"
    );
  }

  const normalizedUsername = normalizeUsername(username);

  // ✅ match unique index behavior (case-insensitive)
  const existing = await User.findOne({ username: normalizedUsername })
    .collation({ locale: "en", strength: 2 })
    .exec();

  if (existing) {
    throw new ApiError(409, "User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: normalizedUsername,
    email,
    passwordHash,
    firstName,
    lastName,
    role: (role as any) || "ADMIN",
    isActive: typeof isActive === "boolean" ? isActive : true,
  });

  res.status(201).json({
    user: buildUserPayload(user),
  });
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  if (!username || !password) {
    throw ApiError.badRequest("username and password are required");
  }

  const normalizedUsername = normalizeUsername(username);

  const user = await User.findOne({ username: normalizedUsername })
    .collation({ locale: "en", strength: 2 })
    .exec();

  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User is inactive");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  res.json({
    token,
    user: buildUserPayload(user),
  });
}

// GET /api/auth/me
export async function me(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Not authenticated");
  }

  const user = await User.findById(req.user.id).exec();
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json({ user: buildUserPayload(user) });
}
