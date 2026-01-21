// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { ApiError } from "../utils/ApiError";

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export type Role = "ADMIN" | "HR" | "SUPERVISOR" | "ESS" | "ESS_VIEWER";

export type AuthUser = {
  id: string;
  role: Role;
  username?: string;
  email?: string;
};

export type AuthRequest = Request & { user?: AuthUser };

function normalizeRole(input: unknown): Role {
  const r = String(input || "").toUpperCase();
  if (r === "ADMIN" || r === "HR" || r === "SUPERVISOR" || r === "ESS_VIEWER") return r;
  return "ESS";
}

/**
 * Type guard to guarantee req.user exists
 */
function assertAuthed(req: AuthRequest): asserts req is Request & { user: AuthUser } {
  if (!req.user?.id) {
    throw ApiError.unauthorized("Missing auth user");
  }
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) return next(ApiError.unauthorized("Missing auth token"));

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    const userId = payload.sub || payload.id || payload.userId;
    if (!userId) return next(ApiError.unauthorized("Invalid auth token payload"));

    req.user = {
      id: String(userId),
      role: normalizeRole(payload.role),
      username: payload.username,
      email: payload.email,
    };

    assertAuthed(req);

    // 🔒 ESS_VIEWER = read-only
    if (req.user.role === "ESS_VIEWER" && !READ_ONLY_METHODS.has(req.method)) {
      return next(ApiError.forbidden("Read-only role: changes are not allowed"));
    }

    return next();
  } catch {
    return next(ApiError.unauthorized("Invalid auth token"));
  }
}
