import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { ApiError } from "../utils/ApiError";

const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Type guard to guarantee req.user exists
 */
function assertAuthed(
  req: Request
): asserts req is Request & { user: Express.User } {
  if (!req.user) {
    throw ApiError.unauthorized("Missing auth user");
  }
}

export function requireAuth(
  req: Request,
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

    // ✅ Attach user (matches express.d.ts)
    req.user = {
      id: String(userId),
      role: role,
      username: payload.username,
      email: payload.email,
    };

    // ✅ TS narrowing
    assertAuthed(req);

    /**
     * 🔒 HARD BACKEND PROTECTION
     * ESS_VIEWER = read-only
     */
    if (
      req.user.role === "ESS_VIEWER" &&
      !READ_ONLY_METHODS.has(req.method)
    ) {
      return next(
        ApiError.forbidden("Read-only role: changes are not allowed")
      );
    }

    return next();
  } catch {
    return next(ApiError.unauthorized("Invalid auth token"));
  }
}
