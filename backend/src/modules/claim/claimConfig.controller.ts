import { Request, Response } from "express";
import { ClaimEvent } from "./claimEvent.model";
import { ExpenseType } from "./expenseType.model";

// helper
function pagingResponse<T>(items: T[], total: number) {
  return { items, total };
}

// EVENTS
export async function getClaimEvents(req: Request, res: Response) {
  const events = await ClaimEvent.find().sort({ createdAt: -1 });
  res.json(pagingResponse(events, events.length));
}

export async function createClaimEvent(req: Request, res: Response) {
  const { name, status } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  const existing = await ClaimEvent.findOne({ name: name.trim() });
  if (existing) {
    return res.status(409).json({ message: "Event already exists" });
  }
  const event = await ClaimEvent.create({
    name: name.trim(),
    status: status || "ACTIVE",
  });
  res.status(201).json(event);
}

export async function updateClaimEvent(req: Request, res: Response) {
  const { id } = req.params;
  const { name, status } = req.body;

  const event = await ClaimEvent.findById(id);
  if (!event) return res.status(404).json({ message: "Event not found" });

  if (name) event.name = name.trim();
  if (status) event.status = status;
  await event.save();
  res.json(event);
}

export async function deleteClaimEvent(req: Request, res: Response) {
  const { id } = req.params;
  const event = await ClaimEvent.findByIdAndDelete(id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  res.json({ success: true });
}

// EXPENSE TYPES
export async function getExpenseTypes(req: Request, res: Response) {
  const types = await ExpenseType.find().sort({ createdAt: -1 });
  res.json(pagingResponse(types, types.length));
}

export async function createExpenseType(req: Request, res: Response) {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  const existing = await ExpenseType.findOne({ name: name.trim() });
  if (existing) {
    return res.status(409).json({ message: "Expense type already exists" });
  }
  const type = await ExpenseType.create({ name: name.trim() });
  res.status(201).json(type);
}

export async function updateExpenseType(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;

  const type = await ExpenseType.findById(id);
  if (!type) return res.status(404).json({ message: "Expense type not found" });

  if (name) type.name = name.trim();
  await type.save();
  res.json(type);
}

export async function deleteExpenseType(req: Request, res: Response) {
  const { id } = req.params;
  const type = await ExpenseType.findByIdAndDelete(id);
  if (!type) return res.status(404).json({ message: "Expense type not found" });
  res.json({ success: true });
}
