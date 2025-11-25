import { Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { AuthRequest } from "./authMiddleware";

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("User not authenticated"));
    }

    const userRole = req.user.role;

    // If array contains "admin", "HR", etc.
    if (!allowedRoles.includes(userRole)) {
      return next(ApiError.forbidden("You do not have permission"));
    }

    next();
  };
}
