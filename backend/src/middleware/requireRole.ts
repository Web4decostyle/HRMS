import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { ApiError } from "../utils/ApiError";

export type Role = "ADMIN" | "HR" | "ESS" | "ESS_VIEWER" | "SUPERVISOR";

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized("User not authenticated"));

    const userRole = req.user.role as Role;

    if (!allowedRoles.includes(userRole)) {
      return next(ApiError.forbidden("You do not have permission"));
    }
    next();
  };
}
