// backend/src/middleware/enforceAdminWrites.ts
import { NextFunction, Response } from "express";
import { AuthRequest } from "./authMiddleware";
import { ApiError } from "../utils/ApiError";

/**
 * Global safety net:
 * - Any non-ADMIN write (POST/PUT/PATCH/DELETE) is BLOCKED
 * - unless the route handled it via adminOrRequestChange (sets res.locals.__approvalHandled = true)
 */
const READ_ONLY_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function enforceAdminWrites(req: AuthRequest, res: Response, next: NextFunction) {
  if (READ_ONLY_METHODS.has(req.method)) return next();

  const role = req.user?.role;
  if (!role) return next(ApiError.unauthorized("Unauthorized"));

  // Admin can write
  if (role === "ADMIN") return next();

  // If route already converted this write into a change-request → allow
  if (res.locals.__approvalHandled) return next();

  // Otherwise BLOCK (this prevents accidental direct edits)
  return next(
    ApiError.forbidden(
      "Direct edit is not allowed. Submit an Admin approval request instead."
    )
  );
}
