// backend/src/modules/claim/claim.controller.ts
import { Request, Response } from "express";
import { ClaimType, ClaimRequest } from "./claim.model";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ApiError } from "../../utils/ApiError";

/* Small helper to wrap arrays like your other APIs */
function toPaginated<T>(items: T[]) {
  return { items, total: items.length };
}

/* ======================= Claim Types ======================= */

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

/* ======================= Claim Requests ==================== */

/**
 * POST /api/claim
 * Employee submits own claim
 */
export async function submitClaim(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { typeId, amount, currency, claimDate, description } = req.body;
  if (!typeId || amount == null || !claimDate) {
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

/**
 * POST /api/claim/assign
 * HR/Admin assigns a claim to an employee
 */
export async function assignClaim(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { employeeId, typeId, amount, currency, claimDate, description } =
    req.body;

  if (!employeeId || !typeId) {
    throw ApiError.badRequest("employeeId and typeId are required");
  }

  const claim = await ClaimRequest.create({
    employee: employeeId,
    type: typeId,
    amount: amount ?? 0,
    currency: currency ?? "INR",
    claimDate: claimDate ? new Date(claimDate) : new Date(),
    description,
  });

  res.status(201).json(claim);
}

/**
 * GET /api/claim/my
 * Logged-in employee’s own claims (with filters)
 */
export async function listMyClaims(req: AuthRequest, res: Response) {
  if (!req.user?.id) throw ApiError.unauthorized("Not authenticated");

  const { referenceId, typeId, status, fromDate, toDate } = req.query as {
    referenceId?: string;
    typeId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  };

  const query: any = { employee: req.user.id };

  if (referenceId) {
    query.referenceId = new RegExp(referenceId, "i");
  }
  if (typeId) query.type = typeId;
  if (status) query.status = status;

  if (fromDate || toDate) {
    query.claimDate = {};
    if (fromDate) query.claimDate.$gte = new Date(fromDate);
    if (toDate) query.claimDate.$lte = new Date(toDate);
  }

  const claims = await ClaimRequest.find(query)
    .populate("type")
    .sort({ claimDate: -1 })
    .lean();

  res.json(toPaginated(claims));
}

/**
 * GET /api/claim
 * HR/Admin Employee Claims view (with filters)
 */
export async function listAllClaims(req: Request, res: Response) {
  const {
    employeeName,
    referenceId,
    typeId,
    status,
    fromDate,
    toDate,
    include,
  } = req.query as {
    employeeName?: string;
    referenceId?: string;
    typeId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    include?: "CURRENT" | "ALL";
  };

  const query: any = {};

  if (referenceId) {
    query.referenceId = new RegExp(referenceId, "i");
  }
  if (typeId) query.type = typeId;
  if (status) query.status = status;

  if (fromDate || toDate) {
    query.claimDate = {};
    if (fromDate) query.claimDate.$gte = new Date(fromDate);
    if (toDate) query.claimDate.$lte = new Date(toDate);
  }

  const claims = await ClaimRequest.find(query)
    .populate("employee")
    .populate("type")
    .sort({ claimDate: -1 })
    .lean();

  // Filter by employeeName and include (CURRENT / ALL) in memory
  const filtered = claims.filter((c: any) => {
    if (employeeName) {
      const full = `${c.employee?.firstName ?? ""} ${
        c.employee?.lastName ?? ""
      }`
        .trim()
        .toLowerCase();
      if (!full.includes(employeeName.toLowerCase())) return false;
    }

    if (include && include !== "ALL") {
      // assuming Employee has status field with "ACTIVE"/"INACTIVE"
      if (c.employee?.status && c.employee.status !== "ACTIVE") return false;
    }

    return true;
  });

  res.json(toPaginated(filtered));
}

/**
 * PATCH /api/claim/:id/status
 */
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
