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
    role: user.role,
    isActive: user.isActive,
    firstName: (user as any).firstName,
    lastName: (user as any).lastName,
    email: (user as any).email,
  };
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  const { username, email, password, firstName, lastName } = req.body;

  if (!username || !password || !firstName || !lastName) {
    throw ApiError.badRequest(
      "username, password, firstName, lastName are required"
    );
  }

  const normalizedUsername = normalizeUsername(username);

  // unique username check (case-insensitive)
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

    // ✅ FIX: public register always ESS
    role: "ESS",

    isActive: true,
  });

  // If you want token on register (optional, but common):
  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      username: user.username,
    },
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  return res.status(201).json({
    token,
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