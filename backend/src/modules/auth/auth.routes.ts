// backend/src/modules/auth/auth.routes.ts
import { Router } from "express";
import { login, register, me } from "./auth.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/requireRole";
import { asyncHandler } from "../../utils/asyncHandler";
import { adminCreateUser } from "./adminUser.controller";

const router = Router();

router.post("/register", asyncHandler(register)); 
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

router.post(
  "/admin/create-user",
  requireAuth,
  requireRole("ADMIN", "HR"),
  asyncHandler(adminCreateUser)
);

export default router;