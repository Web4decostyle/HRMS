// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { ApiError } from "../utils/ApiError";

export interface AuthUser {
  id: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice(7).trim()
    : null;

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

    req.user = { id: String(userId), role: String(role) };
    next();
  } catch (err) {
    return next(ApiError.unauthorized("Invalid auth token"));
  }
}
