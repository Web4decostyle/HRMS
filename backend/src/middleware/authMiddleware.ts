import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { ApiError } from "../utils/ApiError";

export interface AuthUser {
  id: string;
  username?: string;
  role: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return next(ApiError.unauthorized("Missing auth token"));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    const userId = payload.sub || payload.id || payload.userId;
    const role = payload.role || "ESS";

    if (!userId) {
      return next(ApiError.unauthorized("Invalid auth token payload"));
    }

    req.user = {
      id: String(userId),
      role: String(role),
      username: payload.username,
      email: payload.email,
    };

    /**
     * ✅ HARD BACKEND PROTECTION
     * ESS_VIEWER is view-only: can only read.
     * NOTE: SUPERVISOR is NOT view-only (supervisors must be able to approve/act).
     */
    if (req.user.role === "ESS_VIEWER" && !READ_ONLY_METHODS.has(req.method)) {
      return next(ApiError.forbidden("Read-only role: changes are not allowed"));
    }

    next();
  } catch (err) {
    return next(ApiError.unauthorized("Invalid auth token"));
  }
}
