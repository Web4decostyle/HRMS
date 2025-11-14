// backend/src/modules/claim/claim.controller.ts
import { Request, Response } from "express";
import { ClaimType, ClaimRequest } from "./claim.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";

/* ===== Claim Types ===== */

export async function listClaimTypes(_req: Request, res: Response) {
  const types = await ClaimType.find({ isActive: true }).lean();
  res.json(types);
}

export async function createClaimType(req: Request, res: Response) {
  const { name, code, description } = req.body;
  if (!name || !code) {
    throw ApiError.badRequest("name and code are required");
  }

  const existing = await ClaimType.findOne({ code }).exec();
  if (existing) {
    throw new ApiError(409, "Claim type with this code already exists");
  }

  const type = await ClaimType.create({
    name,
    code,
    description,
  });

  res.status(201).json(type);
}

/* ===== Claim Requests ===== */

// POST /api/claim
export async function submitClaim(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { typeId, amount, currency, claimDate, description } = req.body;
  if (!typeId || !amount || !claimDate) {
    throw ApiError.badRequest("typeId, amount and claimDate are required");
  }

  const claim = await ClaimRequest.create({
    employee: req.user.id,
    type: typeId,
    amount,
    currency,
    claimDate,
    description,
  });

  res.status(201).json(claim);
}

// GET /api/claim/my
export async function listMyClaims(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const claims = await ClaimRequest.find({ employee: req.user.id })
    .populate("type")
    .sort({ claimDate: -1 })
    .lean();

  res.json(claims);
}

// GET /api/claim
export async function listAllClaims(_req: Request, res: Response) {
  const claims = await ClaimRequest.find()
    .populate("employee")
    .populate("type")
    .sort({ claimDate: -1 })
    .lean();

  res.json(claims);
}

// PATCH /api/claim/:id/status
export async function updateClaimStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;

  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) {
    throw ApiError.badRequest("Invalid status");
  }

  const claim = await ClaimRequest.findById(id).exec();
  if (!claim) {
    throw ApiError.notFound("Claim not found");
  }

  claim.status = status;
  await claim.save();

  res.json(claim);
}
