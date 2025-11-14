// backend/src/modules/directory/directory.routes.ts
import { Router } from "express";
import { searchDirectory } from "./directory.controller";
import { requireAuth } from "../../middleware/authMiddleware";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/directory/employees
router.get("/employees", requireAuth, asyncHandler(searchDirectory));

export default router;
