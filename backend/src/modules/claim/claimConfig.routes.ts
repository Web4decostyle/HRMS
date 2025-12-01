import { Router } from "express";
import {
  getClaimEvents,
  createClaimEvent,
  updateClaimEvent,
  deleteClaimEvent,
  getExpenseTypes,
  createExpenseType,
  updateExpenseType,
  deleteExpenseType,
} from "./claimConfig.controller";

const router = Router();

// /api/claim-config/events
router.get("/events", getClaimEvents);
router.post("/events", createClaimEvent);
router.put("/events/:id", updateClaimEvent);
router.delete("/events/:id", deleteClaimEvent);

// /api/claim-config/expense-types
router.get("/expense-types", getExpenseTypes);
router.post("/expense-types", createExpenseType);
router.put("/expense-types/:id", updateExpenseType);
router.delete("/expense-types/:id", deleteExpenseType);

export default router;
