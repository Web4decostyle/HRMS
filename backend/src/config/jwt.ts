// backend/src/config/jwt.ts
import { ENV } from "./env";

export const JWT_SECRET = ENV.JWT_SECRET;
export const JWT_EXPIRES_IN = ENV.JWT_EXPIRES_IN;
