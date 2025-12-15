import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt";
import { AuthRequest } from "./authMiddleware";
import { ApiError } from "../utils/ApiError";

export const requireMaintenanceAccess =
  (scope: string) =>
  (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token = req.headers["x-maintenance-token"];
    if (!token || typeof token !== "string") {
      return next(ApiError.forbidden("Maintenance authentication required"));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET!) as any;

      if (payload.typ !== "maintenance")
        throw ApiError.forbidden("Invalid maintenance token");

      if (payload.scope !== scope)
        throw ApiError.forbidden("Invalid maintenance scope");

      if (String(payload.sub) !== String(req.user?.id))
        throw ApiError.forbidden("Token does not match user");

      next();
    } catch {
      next(ApiError.forbidden("Maintenance authorization expired"));
    }
  };
