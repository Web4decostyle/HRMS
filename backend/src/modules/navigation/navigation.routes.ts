// backend/src/modules/navigation/navigation.routes.ts
import { Router } from "express";
import { getMenu } from "./navigation.controller";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

// GET /api/navigation/menu
router.get("/menu", requireAuth, getMenu);

export default router;
