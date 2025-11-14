// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ENV } from "../config/env";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isApiError = err instanceof ApiError;

  const status = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Internal server error";

  if (!isApiError || ENV.NODE_ENV !== "production") {
    console.error("API Error:", err);
  }

  res.status(status).json({
    message,
  });
}
