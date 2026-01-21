// backend/src/middleware/requireRole.ts
import { Response, NextFunction } from "express";
import { AuthRequest, Role } from "./authMiddleware";
import { ApiError } from "../utils/ApiError";

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized("User not authenticated"));

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return next(ApiError.forbidden("You do not have permission"));
    }

    next();
  };
}
