// backend/src/middleware/requireRole.ts
import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import { ApiError } from "../utils/ApiError";

export function requireRole(...allowed: string[]) {
  return function (req: AuthRequest, _res: Response, next: NextFunction) {
    const role = req.user?.role;
    if (!role) {
      return next(ApiError.unauthorized("No user role"));
    }
    if (!allowed.includes(role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }
    next();
  };
}
